export interface IUser{ id:string; name:string; email:string; role:"user"|"admin"; }
export interface IListing{ _id:string; title:string; description:string; category:string; price?:number; startingPrice?:number; ratingAverage?:number; }
