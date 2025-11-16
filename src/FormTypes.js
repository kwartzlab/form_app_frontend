const formTypes = {
    "Reimbursement Request": {
        "title": "Reimbursement Request", 
        "blurb": "This form is for submitting already-approved purchases (or lab consumables under $50). If you need to get approval for a new purchase, use the Purchase Approval Form instead.",
        "endpoint": "/submit",
    },
    "Purchase Approval": {
        "title": "Purchase Approval", 
        "blurb": "Most purchases require pre-approval from the board, in order to be eligible for reimbursement. This is the form you use to get permission to buy things for the lab.\nThis form posts directly to the members mailing list, where discussion & approval (+1s by the board) will take place. Be sure to keep an eye on the list for any questions we might have!\nIf your purchase is approved, don’t forget to keep your receipts!",
        "endpoint": "/submit-PA"
    }
};

export default formTypes