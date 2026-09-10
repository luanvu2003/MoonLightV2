import { Model } from 'mongoose';
import { IUser } from '../types/models.types.js';
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export type UserModel = Model<IUser, {}, IUserMethods>;
export declare const User: UserModel;
