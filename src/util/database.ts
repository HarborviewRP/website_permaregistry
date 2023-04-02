import { Interview } from "./../types";
import { Filter, ObjectId } from "mongodb";
import { Application, User } from "src/types";
import {
  closeConnection,
  getApplicationCollection,
  getInterviewCollection,
  getUserCollection,
} from "./mongodb";
import { DISCORD } from "src/types";

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

export const getUserApplicationsInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const applicationCollection = await getApplicationCollection();
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

export const getApplicationsInRange = async (
  startDate: Date,
  endDate: Date
) => {
  const applicationCollection = await getApplicationCollection();
  try {
    const res = await applicationCollection.collection
      .find({
        submissionDate: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getApplicationPage = async (
  page: number,
  pageLength: number,
  userId?: string
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await applicationCollection.collection
    .find(userId ? { applicantId: userId } : {})
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
  sortStatus: "asc" | "desc",
  userId?: string
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const applications = await applicationCollection.collection
    .find(userId ? { applicantId: userId } : {})
    .sort({ status: sortDirection })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const createInterview = async (interview: Interview) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.insertOne(interview);
  return res;
};

export const getInterview = async (id: string) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.findOne({ _id: id });
  return res;
};

export const getallInterviews = async () => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.find().toArray();

  return res;
};

export const getInterviewPage = async (page: number, pageLength: number, userId?: string) => {
  const interviewCollection = await getInterviewCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await interviewCollection.collection
  .find(userId ? { applicantId: userId } : {})
  .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const updateInterview = async (
  id: string,
  updatedInterview: Partial<Interview>
) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.updateOne(
    { _id: id },
    { $set: updatedInterview }
  );

  return res;
};

export const deleteInterview = async (id: string) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.deleteOne({
    _id: id,
  });

  return res;
};

export const getSortedInterviews = async (
  page: number,
  pageLength: number,
  sortStatus: "asc" | "desc",
  userId?: string
) => {
  const interviewCollection = await getInterviewCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const interviews = await interviewCollection.collection
    .find(userId ? { applicantId: userId } : {})
    .sort({ status: sortDirection })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return interviews;
};

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

export const getTotalApplications = async (userId?: string) => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments(userId ? { applicantId: userId } : {});
  return totalApplications;
};

export const getApplicationsReviewedPercentage = async () => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments();
  const reviewedApplications =
    await applicationCollection.collection.countDocuments({
      status: { $in: [1, 2] },
    });

  const percentage = (reviewedApplications / totalApplications) * 100;
  return percentage;
};

export const getApplicationsStats = async () => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments();
  const approvedApplications =
    await applicationCollection.collection.countDocuments({ status: 1 });

  const deniedApplications =
    await applicationCollection.collection.countDocuments({ status: 2 });

  const approvedPercentage = (approvedApplications / totalApplications) * 100;
  const deniedPercentage = (deniedApplications / totalApplications) * 100;

  return { approved: approvedPercentage, denied: deniedPercentage };
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

export const getApplicationStatusStats = async () => {
  const applicationCollection = await getApplicationCollection();
  const applicationStatusStats = await applicationCollection.collection
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  return applicationStatusStats;
};

// interview utils
export const getTotalInterviews = async (userId?: string) => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments(userId ? { applicantId: userId } : {});
  return totalInterviews;
};

export const getInterviewsReviewedPercentage = async () => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments();
  const reviewedInterviews =
    await interviewCollection.collection.countDocuments({
      status: { $in: [1, 2] },
    });

  const percentage = (reviewedInterviews / totalInterviews) * 100;
  return percentage;
};

export const getInterviewStats = async () => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments();
  const approvedInterviews =
    await interviewCollection.collection.countDocuments({ status: 1 });

  const deniedInterviews = await interviewCollection.collection.countDocuments({
    status: 2,
  });

  const approvedPercentage = (approvedInterviews / totalInterviews) * 100;
  const deniedPercentage = (deniedInterviews / totalInterviews) * 100;

  return { approved: approvedPercentage, denied: deniedPercentage };
};

export const getInterviewStatusStats = async () => {
  const interviewCollection = await getInterviewCollection();
  const applicationStatusStats = await interviewCollection.collection
    .aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  return applicationStatusStats;
};

export const getInterviewsPerDay = async (startDate: Date, endDate: Date) => {
  const interviewCollectionObj = await getInterviewCollection();
  const interviewCollection = interviewCollectionObj.collection;

  const results = await interviewCollection
    .aggregate([
      {
        $match: {
          creationDate: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $toDate: "$creationDate",
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();

  const lineChartData = results.map((result) => ({
    date: result._id,
    count: result.count,
  }));

  return lineChartData;
};

export const getApplicationsPerDay = async (startDate: Date, endDate: Date) => {
  const applicationCollectionObj = await getApplicationCollection();
  const applicationCollection = applicationCollectionObj.collection;

  const results = await applicationCollection
    .aggregate([
      {
        $match: {
          submissionDate: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $toDate: "$submissionDate",
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();

  const lineChartData = results.map((result) => ({
    date: result._id,
    count: result.count,
  }));

  return lineChartData;
};
