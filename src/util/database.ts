import { ObjectId } from "mongodb";
import { Application } from "src/types";
import { getApplicationCollection } from "./mongodb";

export const createApplication = async (application: Application) => {
  const applicationCollection = await getApplicationCollection();
  return await applicationCollection.insertOne(application);
};

export const getApplicationById = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  try {
    return await applicationCollection.findOne({ _id: new ObjectId(id) });
  } catch (err) {
    return null;
  }
};

export const getAllApplications = async () => {
  const applicationCollection = await getApplicationCollection();
  return await applicationCollection.find().toArray();
};

export const getApplicationPage = async (page: number, pageLength: number) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await applicationCollection
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
  return await applicationCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedApplication }
  );
};

export const deleteApplication = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  return await applicationCollection.deleteOne({ _id: new ObjectId(id) });
};

export const getSortedApplications = async (
  page: number,
  pageLength: number,
  sortStatus: "asc" | "desc"
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const applications = await applicationCollection
    .find()
    .sort({ status: sortDirection })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};
