export type LoginRequest = {
  email: string;
  password: string;
};
export type LoginResponse = {
  data: {
    userName: string;
    userEmail: string;
    allowedIn: string[] | undefined;
    tokenExp: number | undefined;
  };
  secureCookie: {
    token: string;
  };
};
