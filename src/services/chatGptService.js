const OpenAI = require("openai");
const models = require("../models/index");
const { meetingsFindOneFn } = require("./meetingService");
const { saveFAQsFn } = require("./meetingFAQsService");
const { UPDATE } = require("../config/action.config");
const CommonService  = require('./CommonService')

// <=======chatGpt Bot service====>

exports.chatGPTBot = async (data, userId) => {
  try {
    let assistant;
    let threadId;
    let runId;
    let runStatusVal;
    let respStatus;
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    // Check for the assistant and thread id if they exist
    if (data.meeting_id) {
      let responseData = await this.syncChatGptResp(data.meeting_id, false , data.ipAddress , data.userId);
      console.log("🚀 ~ exports.chatGPTBot= ~ responseData:", responseData)
      respStatus = responseData?.status;
      assistant = responseData?.assistantId;
      threadId = responseData?.threadId;
      runId = responseData?.runId;
      runStatusVal = responseData?.runStatus;
    }
    if (
      respStatus === 1 &&
      (runStatusVal === "completed" || runStatusVal === "failed" || runStatusVal==="expired" || runStatusVal === "incomplete")
    ) {
      let baseOptions = {
        where: {
          id: data.meeting_id,
          deleted: 0,
        },
      };

      // Check if the assistant and thread are created; if created, use them; else create new ones
      let meetingResponse = await meetingsFindOneFn(baseOptions);

      // Send the user prompt to the thread
      const message = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: data.prompt,
      });

      // Run the assistant's response
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistant.id,
        instructions:
          "You are an expert on meeting details. Provide information on date, time, agenda, and participants when asked. Offer to assist with any related questions or actions. Please address the user as meeting participants.",
      });

      // Function to check the status of the run and print messages
      const checkStatusAndPrintMessages = async (threadId, runId) => {
        const maxRetries = 5; // Maximum number of retries
        const retryInterval = 5000; // Interval between retries (in milliseconds)
        let attempts = 0;

        let actionLogOption = {id : data?.userId};
          actionLogOption = await CommonService.actionLogs(
            "meetings",
            meetingResponse?.dataValues?.id,
            UPDATE,
            actionLogOption,
            userId,
            userId,
            data?.ipAddress
          );

        while (attempts < maxRetries) {
          attempts++;
          let runStatus = await openai.beta.threads.runs.retrieve(
            threadId,
            runId
          );

          if (runStatus.status === "completed") {
            let messages = await openai.beta.threads.messages.list(threadId);
            // <========= update the runid status table name and row id =====>
            let chatGptResponse = {
              meeting_id: data.meeting_id,
              question: data.prompt,
              answer_type: messages?.data[0]?.content[0]?.type,
              answer_text: messages?.data[0]?.content[0]?.text?.value,
              createdBy: userId,
            };
            let createData = await saveFAQsFn(chatGptResponse);
            meetingResponse.update({
              run_id: runId,
              run_status: "completed",
              run_tb_name: "meeting_faqs",
              run_tb_id: createData?.id,
            } ,actionLogOption);
            return {
              status: 1,
              message: messages.data,
            };
          } else if (runStatus.status === "failed") {
            // <========= update the runid status table name and row id =====>
            meetingResponse.update({
              run_id: runId,
              run_status: "failed",
              run_tb_name: "meeting_faqs",
              run_tb_id: null,
            },actionLogOption);
            return {
              status: 0,
              message: "Run failed.",
            };
          }

          await new Promise((resolve) => setTimeout(resolve, retryInterval)); // Wait before rechecking
        }

        meetingResponse.update({
          run_id: runId,
          run_status: "queued",
          run_tb_name: "meeting_faqs",
          run_tb_id: null,
        } , actionLogOption);

        return {
          status: 0,
          message:
            "Run did not complete in the expected time. The request is in queued state.",
        };
      };

      // Wait for the run to complete and get the messages
      const messages = await checkStatusAndPrintMessages(threadId, run.id);

      return {
        status: 1,
        data: messages,
      };
    } else {
      return {
        status: 0,
        message: "Please try again after sometime . processing you request",
      };
    }
  } catch (error) {
    console.error("Error in chatGPTBot service:", error);
    return {
      status: 0,
      message: "An error occurred while processing the request.",
    };
  }
};

// <================ CREATE ASSISTANT FUNCTION ================>
exports.createAssistant = async (openai, name, instruction) => {
  try {
    let assistant = await openai.beta.assistants.create({
      name: name,
      instructions: instruction,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-3.5-turbo-1106",
    });
    return assistant;
  } catch (error) {
    console.error("error in createAssistant service", error);
    return false;
  }
};

// <============================== CREATE THREAD FUNCTION ==================>
exports.createThread = async (openai) => {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("error in chatGotBot service", error);
    return false;
  }
};

// <==============sync the chatGpt FAQ and its response ======>
exports.syncChatGptResp = async (meetingId, syncCheck , ipAddress , userId) => {
  try {
    let assistant;
    let threadId;
    let runId;
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
    let baseOptions = {
      where: {
        id: meetingId,
        deleted: 0,
      },
    };

    // Check if the assistant and thread are created; if created, use them; else create new ones
    let meetingResponse = await meetingsFindOneFn(baseOptions , userId);

    if (meetingResponse && meetingResponse.dataValues) {
      if (meetingResponse.dataValues.assistant_id) {
        assistant = {
          id: meetingResponse.dataValues.assistant_id,
        };
      }
      if (meetingResponse.dataValues.thread_id) {
        threadId = meetingResponse.dataValues.thread_id;
      }
      if (meetingResponse.dataValues.run_id) {
        runId = meetingResponse.dataValues.run_id;
      }

      // If either assistant_id or thread_id is missing, return status 0 indicating the video is not yet transcribed
      if (!assistant || !threadId) {
        return {
          status: 0,
          message: "Referenced video is not transcribed yet.",
        };
      }


      if (!runId) {
        return {
          status: 0,
          message: "Run Id is required",
        };
      }

      // <================ check the run status ============================>
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      if (runStatus) {
        // every time we need to update the runstatus to check if there is any changes....
        if (
          syncCheck &&
          meetingResponse?.dataValues?.run_status !== runStatus.status
        ) {
          let actionLogOption = {id : userId};
          actionLogOption = await CommonService.actionLogs(
            "meetings",
            meetingResponse?.dataValues?.id,
            UPDATE,
            actionLogOption,
            userId,
            userId,
            ipAddress
          );
          await meetingResponse.update({ run_status: runStatus.status } , actionLogOption);
        }
        return {
          status: 1,
          assistantId: assistant,
          threadId: threadId,
          runId: runId,
          runStatus: runStatus.status,
        };
      }
    } else {
      // If no meeting response, return status 0
      return {
        status: 0,
        message: "Meeting not found.",
      };
    }
  } catch (error) {
    return {
      status: 0,
      message: "An error occurred while processing the request.",
    };
  }
};
