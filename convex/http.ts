import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";
import {
  getDietPropmt,
  getWorkoutPropmt,
  validateDietPlan,
  validateWorkoutPlan,
} from "../src/lib/genAi";

const http = httpRouter();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = req.headers.get("svix-id");
    const svix_sig = req.headers.get("svix-signature");
    const svix_timestamp = req.headers.get("svix-timestamp");

    if (!svix_id || !svix_sig || !svix_timestamp) {
      return new Response("Missing svix headers", {
        status: 400,
      });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_sig,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Error verifying webhook event", error);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } =
        evt.data;

      const email = email_addresses[0].email_address;

      const name = `${first_name ?? ""} ${last_name ?? ""}`;

      try {
        await ctx.runMutation(api.users.syncUser, {
          email: email,
          name: name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.error("Error creating the user", error);
        return new Response("Error creating the user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const payload = await req.json();

      const {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      } = payload;

      const workoutPrompt = getWorkoutPropmt(
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level
      );

      const workoutResult = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: workoutPrompt,
        config: {
          temperature: 0.4,
          topP: 0.9,
          responseMimeType: "application/json",
        },
      });

      let workoutPlan = JSON.parse(workoutResult.text ?? "");
      workoutPlan = validateWorkoutPlan(workoutPlan);

      const dietPrompt = getDietPropmt(
        age,
        height,
        weight,
        dietary_restrictions,
        fitness_goal
      );

      const dietResult = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: dietPrompt,
        config: {
          temperature: 0.4,
          topP: 0.9,
          responseMimeType: "application/json",
        },
      });

      let dietPlan = JSON.parse(dietResult.text ?? "");
      dietPlan = validateDietPlan(dietPlan);

      const planId = await ctx.runMutation(api.plan.createPlan, {
        userId: user_id,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
        workoutPlan: workoutPlan,
        dietPlan: dietPlan,
        isActive: true,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error generating program", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
