type ActionResponse<Data = any> =
	| {
			success: false;
			message: string;
	  }
	| {
			success: true;
			data: Data | null;
	  };

export type { ActionResponse };
