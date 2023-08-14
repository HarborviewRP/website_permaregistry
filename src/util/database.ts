import { Action, ChangeLog, DeathReg, FormActionChange, FormType, Interview } from "./../types";
import { Filter, ObjectId } from "mongodb";
import { Application, User } from "src/types";
import {
  closeConnection,
  getDeathRegistryCollection,
  getUserCollection,
} from "./mongodb";
import { DISCORD } from "src/types";

export const getUser = async (id: string) => {
  const userCollection = await getUserCollection();
  const user = await userCollection.collection.findOne({ _id: id });
  return user;
};

export const getUsers = async (ids: string[]) => {
  const userCollection = await getUserCollection();
  const users = await userCollection.collection
    .find({ _id: { $in: ids } })
    .toArray();
  return users;
};

export const getTotalStaffMembers = async () => {
  const userCollection = await getUserCollection();
  const staffMembers = await userCollection.collection.countDocuments({
    $or: [
      { roles: { $in: [DISCORD.STAFF_ROLE_ID, DISCORD.SUPERADMIN_ROLE] } },
      { access_level: { $gt: 0 } },
    ],
  });
  return staffMembers;
};

export const getTotalRegistries = async () => {
  const applicationCollection = await getDeathRegistryCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments();
  return totalApplications;
};

export const updateRegistry = async (
  id: string,
  updatedRegistry: Partial<DeathReg>
) => {
  const interviewCollection = await getDeathRegistryCollection();
  const res = await interviewCollection.collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedRegistry }
  );

  return res;
};

export const createDeathRegistry = async (application: DeathReg) => {
  const applicationCollection = await getDeathRegistryCollection();
  const res = await applicationCollection.collection.insertOne(application);

  return res;
};

export const getDeathRegistryById = async (id: string) => {
  const applicationCollection = await getDeathRegistryCollection();
  try {
    const res = await applicationCollection.collection.findOne({
      _id: new ObjectId(id),
    });

    return res;
  } catch (err) {
    return null;
  }
};

export const getDeathRegistries = async () => {
  const applicationCollection = await getDeathRegistryCollection();
  const res = await applicationCollection.collection.find().toArray();

  return res;
};

export const getDeathRegistriesSearchByCsnOrName = async (searchStr: string) => {
  const applicationCollection = await getDeathRegistryCollection();
  const query = {
    $or: [
      { csn: { $regex: searchStr, $options: 'i' } },
      { name: { $regex: searchStr, $options: 'i' } }
    ]
  };
  const res = await applicationCollection.collection.find(query).toArray();

  return res;
};


export const getDeathRegistriesSearchByCsnOrNameWithPage = async (searchStr: string, page: number, pageLength: number,) => {
  const applicationCollection = await getDeathRegistryCollection();
  const query = {
    $or: [
      { csn: { $regex: searchStr, $options: 'i' } },
      { name: { $regex: searchStr, $options: 'i' } }
    ]
  };
  const res = await applicationCollection.collection.find(query).toArray();

  return res;
};


export const getRegistryPage = async (
  page: number,
  pageLength: number,
) => {
  const applicationCollection = await getDeathRegistryCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await applicationCollection.collection
    .find()
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const getDeathRegistriesInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const applicationCollection = await getDeathRegistryCollection();
  try {
    const res = await applicationCollection.collection
      .find({
        userId: userId,
        submissionDate: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const deleteRegistry = async (id: string) => {
  const applicationCollection = await getDeathRegistryCollection();
  const res = await applicationCollection.collection.deleteOne({
    _id: new ObjectId(id),
  });

  return res;
};
