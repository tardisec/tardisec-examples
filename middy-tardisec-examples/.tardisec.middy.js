// middy middleware: handler.use(tardisecHeaders())
import tardisec from "./.tardisec.json" with { type: "json" };

const tardisecHeaders = () => ({
  after: (request) => {
    request.response.headers = {
      ...request.response.headers,
      ...tardisec.http.headers,
    };
  },
});