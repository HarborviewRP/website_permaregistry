import { ObjectId } from "mongodb";
import { Application, User } from "src/types";
import { closeConnection, getApplicationCollection, getUserCollection } from "./mongodb";

export const createApplication = async (application: Application) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.insertOne(application);
  
  return res;
};

export const getApplicationById = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  try {
    const res = await applicationCollection.collection.findOne({
      _id: new ObjectId(id),
    });
    
    
    return res;
  } catch (err) {
    return null;
  }
};

export const getAllApplications = async () => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.find().toArray();
  

  return res;
};

export const getApplicationPage = async (page: number, pageLength: number) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await applicationCollection.collection
    .find()
    .skip(skipCount)
    .limit(pageLength)
    .toArray();
    

  
  return applications;
};

export const updateApplication = async (
  id: string,
  updatedApplication: Partial<Application>
) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedApplication }
  );
  

  return res;
};

export const deleteApplication = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.deleteOne({
    _id: new ObjectId(id),
  });
  

  return res;
};

export const getSortedApplications = async (
  page: number,
  pageLength: number,
  sortStatus: "asc" | "desc"
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const applications = await applicationCollection.collection
    .find()
    .sort({ status: sortDirection })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();
    

  
  return applications;
};

export const getUser = async (
  id: string,
) => {
  const userCollection = await getUserCollection();
  const user = await userCollection.collection.findOne({_id: id})
  return user;
}

export const getUsers = async (
  ids: string[],
) => {
  const userCollection = await getUserCollection();
  const users = await userCollection.collection.find({_id: { $in: ids }}).toArray();
  return users;
}