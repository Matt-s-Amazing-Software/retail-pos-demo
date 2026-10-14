// Writing to the activity log from any screen: the signed-in person and the time are added here.
import { record } from "./activity.js";
import { save, state } from "./store.js";
import { USERS } from "./users.js";

export function log(category, text) {
  const user = USERS.find((u) => u.id === state.currentUser);
  state.activity = record(state.activity, { at: new Date().toISOString(), by: user ? user.name : "Nobody signed in", category, text });
  save();
}
