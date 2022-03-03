export type baseList = {
    name: string;
    items: string[];
};

export type baseInvite = {
    sender: string;
    senderEmail?: string;
    addressee: string;
    list: string;
    listName?: string;
};

export type baseLedgerUser = {
    email: string;
    name: string;
};

export type baseAccount = {
    
}