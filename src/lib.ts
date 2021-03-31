const { IncomingWebhook } = require('@slack/webhook');

export default (url: string): null | { send: (text: string) => Promise<unknown> } => {
  if (!url) {
    return null;
  }

  const webhook = new IncomingWebhook(url);

  return {
    send(text: string): Promise<unknown> {
      return webhook.send({
        text,
      });
    },
  };
};
