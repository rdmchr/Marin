import { Models } from "appwrite";
import { baseAccount, baseInvite, baseLedgerUser, baseList } from "./";

export type AWList = baseList & Models.Document;

export type AWInvite = baseInvite & Models.Document;

export type AWLedgerUser = baseLedgerUser & Models.Document;

export type AWAccount = baseAccount & Models.Preferences;