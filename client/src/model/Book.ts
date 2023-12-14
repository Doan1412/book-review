import { Category } from "./Category";
import { Review} from "./Review";
export interface Book {
    id : number,
    created_at : Date,
    updated_at : Date,
    deleted_at : Date,

    author : string,
    title : string,
    price : number,
    description : string,
    image : string,
    categories: Category[];
    reviews : Review[];
}