const { IncomingWebhook } = require('@slack/webhook');

export default (url: string): { send: (text: string) => Promise<unknown> } => {
  const webhook = new IncomingWebhook(url);

  return {
    send(text: string): Promise<unknown> {
      return webhook.send({
        text,
      });
    },
  };
};
