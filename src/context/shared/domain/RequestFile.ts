type FileType = {
  source: 'local';
  buffer: Buffer;
  mimetype: string;
  filename: string;
  originalname: string;
  path: string;
};

export type RequestFile = FileType | { source: 'remote'; url: string };
