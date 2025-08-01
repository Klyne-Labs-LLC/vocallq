"use server";

import { aiAgentPrompt } from "@/lib/data";
import { prismaClient } from "@/lib/prismaClient";
import { vapiServer } from "@/lib/vapi/vapiServer";

export const createAssistant = async (name: string, userId: string) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
      name: name,
      firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: aiAgentPrompt,
          },
        ],
        temperature: 0.5,
      },
      transcriber: {
        provider: "assembly-ai",
        language: "en", 
        confidenceThreshold: 0.7, // Higher for webinar accuracy
      },
      // Optimize speaking plans for webinar format
      startSpeakingPlan: {
        waitSeconds: 0.8, // Longer wait for thoughtful responses
        smartEndpointingEnabled: true, // Enable for better turn detection
      },
      stopSpeakingPlan: {
        numWords: 2, // Allow brief acknowledgments
        voiceSeconds: 0.3, // More responsive for interruptions
        backoffSeconds: 1.2, // Professional pause before resuming
      },
      serverMessages: [],
    });

    console.log("Assistant created:", createAssistant);

    const aiAgent = await prismaClient.aiAgents.create({
      data: {
        model: "gpt-4o",
        provider: "openai",
        prompt: aiAgentPrompt,
        name: name,
        firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
        userId: userId,
      },
    });

    return {
      success: true,
      status: 200,
      data: aiAgent,
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to create agent",
    };
  }
};

//update assistant
export const updateAssistant = async (
  assistantId: string,
  firstMessage: string,
  systemPrompt: string
) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(assistantId, {
      firstMessage: firstMessage,
      model: {
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      transcriber: {
        provider: "assembly-ai",
        language: "en", 
        confidenceThreshold: 0.7, // Higher for webinar accuracy
      },
      // Optimize speaking plans for webinar format
      startSpeakingPlan: {
        waitSeconds: 0.8, // Longer wait for thoughtful responses
        smartEndpointingEnabled: true, // Enable for better turn detection
      },
      stopSpeakingPlan: {
        numWords: 2, // Allow brief acknowledgments
        voiceSeconds: 0.3, // More responsive for interruptions
        backoffSeconds: 1.2, // Professional pause before resuming
      },
      serverMessages: [],
    });
    console.log("Assistant updated:", updateAssistant);

    const updateAiAgent = await prismaClient.aiAgents.update({
      where: {
        id: assistantId,
      },
      data: {
        firstMessage: firstMessage,
        prompt: systemPrompt,
      },
    });

    return {
      success: true,
      status: 200,
      data: updateAiAgent,
    };
  } catch (error) {
    console.error("Error updating agent:", error);
    return {
      success: false,
      status: 500,
      error: error,
      message: "Failed to update agent",
    };
  }
};
