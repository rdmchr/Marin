import { Models } from "appwrite";
import { type } from "os";

export type AWList = {
    name: string;
    items: string[];
} & Models.Document;

export type AWInvite = {
    sender: string;
    senderEmail?: string;
    addressee: string;
    list: string;
    listName?: string;
} & Models.Document;

export type AWLedgerUser = {
    email: string;
    name: string;
} & Models.Document;

export type AWAccount = {
    
}