import { ObjectId } from "mongodb";
import { getApplicationCollection } from "./mongodb";
import { Application } from "./types";

export const createApplication = async (application: Application) => {
    const applicationCollection = await getApplicationCollection();
    return await applicationCollection.insertOne(application);
  };
  
  export const getApplicationById = async (id: string) => {
    const applicationCollection = await getApplicationCollection();
    return await applicationCollection.findOne({ _id: new ObjectId(id) });
  };
  
  export const getAllApplications = async () => {
    const applicationCollection = await getApplicationCollection();
    return await applicationCollection.find().toArray();
  };
  
  export const updateApplication = async (id: string, updatedApplication: Partial<Application>) => {
    const applicationCollection = await getApplicationCollection();
    return await applicationCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedApplication });
  };
  
  export const deleteApplication = async (id: string) => {
    const applicationCollection = await getApplicationCollection();
    return await applicationCollection.deleteOne({ _id: new ObjectId(id) });
  };