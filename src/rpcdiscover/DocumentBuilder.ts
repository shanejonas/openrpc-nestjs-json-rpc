let doc: any = {};

export default {
  setVersion: (version: string) => {
    doc.info.version = version;
  },
  setDocument: (document: any) => {
    doc = document;
  },
  getDocument: () => {
    return doc;
  },
};
