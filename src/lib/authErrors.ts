import { FirebaseError } from "firebase/app";

export function authErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try logging in instead.";
      case "auth/invalid-email":
        return "That email address is not valid.";
      case "auth/password-does-not-meet-requirements":
        return "Password does not meet all the requirements listed below.";
      case "auth/weak-password":
        return "Password is too weak. Try a longer one.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email or password is incorrect.";
      case "auth/too-many-requests":
        return "Too many attempts. Wait a few minutes and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
    }
  }
  return "Something went wrong. Try again.";
}