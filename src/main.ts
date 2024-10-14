import express, { Express, Request, Response } from "express";
import { appendFileSync } from "fs";

function writeData(data: Object): void {
  appendFileSync("./deploymentData.json", JSON.stringify(data));
}

const app: Express = express();

app.post(
  "/webhook",
  express.json({ type: "application/json" }),
  (request: Request, response: Response) => {
    // Respond to indicate that the delivery was successfully received.
    // Your server should respond with a 2XX response within 10 seconds of receiving a webhook delivery. If your server takes longer than that to respond, then GitHub terminates the connection and considers the delivery a failure.
    response.status(202).send("Accepted");

    // Check the `x-github-event` header to learn what event type was sent.
    const githubEvent = request.headers["x-github-event"];
    console.log(`x-github-event: ${githubEvent}`);
    // You should add logic to handle each event type that your webhook is subscribed to.
    // For example, this code handles the `issues` and `ping` events.
    //
    // If any events have an `action` field, you should also add logic to handle each action that you are interested in.
    // For example, this code handles the `opened` and `closed` actions for the `issue` event.
    //
    // For more information about the data that you can expect for each event type, see "[AUTOTITLE](/webhooks/webhook-events-and-payloads)."
    if (githubEvent === "issues") {
      const data = request.body;
      const action = data.action;
      if (action === "opened") {
        console.log(`An issue was opened with this title: ${data.issue.title}`);
      } else if (action === "closed") {
        console.log(`An issue was closed by ${data.issue.user.login}`);
      } else {
        console.log(`Unhandled action for the issue event: ${action}`);
      }
    } else if (githubEvent === "workflow_run") {
      const data = request.body;
      const action = data.action;
      const workflow_run_name =
        data.workflow_run.name === undefined
          ? "unknown"
          : data.workflow_run.name;
      console.log(
        `A workflow_run fired with this name ${workflow_run_name} with action ${action}`,
      );
    } else if (githubEvent === "workflow_job") {
      const data = request.body;
      const action = data.action;
      const workflow_job_name =
        data.workflow_job.name === undefined
          ? "unknown"
          : data.workflow_job.name;
      console.log(
        `A workflow_job fired with this name ${workflow_job_name} with action ${action}`,
      );
      writeData(data);
    } else if (githubEvent === "deployment") {
      const data = request.body;
      const action = data.action;
      console.log(
        `A deployment fired with this id ${data.deployment.id} with action ${action}`,
      );
      writeData(data);
    } else if (githubEvent === "deployment_status") {
      const data = request.body;
      const action = data.action;
      console.log(
        `A deployment_status fired with this id ${data.deployment_status.id} with action ${action}`,
      );
      writeData(data);
    } else if (githubEvent === "ping") {
      console.log("GitHub sent the ping event");
    } else {
      console.log(`Unhandled event: ${githubEvent}`);
    }
  },
);

const port = 3000;

// This starts the server and tells it to listen at the specified port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
