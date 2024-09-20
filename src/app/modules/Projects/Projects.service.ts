/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { Project } from "./Projects.module";
import { TProjuct } from "./Projects.interface";
import QueryBuilder from "../../builder/QueryBuilder";
import { Todos } from "../Todos/Todos.module";

interface DateRangeQuery {
  firstDate?: Date;
  secondDate?: Date;
}


const addProjectIntoDB = async (payload : TProjuct) =>{
  const lastDocument = await Project.findOne().sort({ _id: -1 }).exec();
    const lastDocumentId = lastDocument?.id || 0;
    const {startsAt, endsAt, ...datas } = payload

    const updateStartsAt = new Date(startsAt).toISOString();
    const updateEndsAt = new Date(endsAt).toISOString();

    const data = {
      ...datas,
      id : lastDocumentId + 1,
      startsAt : updateStartsAt,
      endsAt : updateEndsAt

    }
  const result = await Project.create(data)
  return result  
}




const totalDataCountIntoDB = async () => {
  const [onGoing, completed, started, inReview, defaultStatus, checkedTrue, checkedFalse] = await Promise.all([
    Project.find({ status: "On Going" }).countDocuments(),
    Project.find({ status: "Completed" }).countDocuments(),
    Project.find({ status: "Started" }).countDocuments(),
    Project.find({ status: "In Review" }).countDocuments(),
    Project.find({ status: "Default" }).countDocuments(),
    Todos.find({ checked: "true" }).countDocuments(),
    Todos.find({ checked: "false" }).countDocuments(),
  ]);

  const projectData = {
    OnGoing: onGoing,
    Completed: completed,
    Started: started,
    InReview: inReview,
    Default: defaultStatus,
  };

  const allTasksData = {
    OnGoing: onGoing + 2,
    Completed: completed + 3,
    Started: started + 1,
    InReview: inReview + 2,
    Default: defaultStatus + 6,
  };

  const todoData = {
    CheckedTrue: checkedTrue,
    CheckedFalse: checkedFalse,
  };
  
  return { projectData, todoData, allTasksData };
};


const getAllProjects = async (query: Record<string, unknown>) => {
  if (query.date) {
    const dateRange = query.date as string;
    const [startDateString, endDateString] = dateRange.split(',');
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    query.dateInfo = {
      firstDate: startDate,
      secondDate: endDate,
    } as DateRangeQuery;    
    delete query.date;
  }

  if (query.dateInfo) {
    const { firstDate, secondDate } = query.dateInfo as DateRangeQuery;
    const result = await Project.aggregate([
      {
        $match: {
          [query.fieldName as string]: {
            $gte: firstDate,
            $lte: secondDate,
          },
        },
      },
    ]);  
    return result.reverse();
  } 

  const projectsQuery = new QueryBuilder(
    Project.find(), query,
  )
    .search(["title"])
    .filter()
    // .sort()
    // .fields();
  
  const result = await projectsQuery.modelQuery;
  return result.reverse();
};


const duplicateDataIntoDB = async (mainId: string, title: string) => {
  try {
    const lastDocument = await Project.findOne().sort({ _id: -1 }).exec();
    const lastDocumentId = lastDocument?.id || 0;

    const project = await Project.findById(mainId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const newProjectData = project.toObject() as Partial<typeof Project> & { _id?: mongoose.Types.ObjectId };
    delete newProjectData._id;    

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(startsAt.getDate() + 5);

    const formatDate = (date: Date) => date.toISOString(); 

    const newProject = new Project({
      ...newProjectData,
      title,
      id: lastDocumentId + 1,
      startsAt: formatDate(startsAt), 
      endsAt: formatDate(endsAt)  
    });   
    
    await newProject.save();
    return newProject;
  } catch (error) {
    console.error('Error duplicating project:', error);
    throw error; 
  }
};

const getAllFavouriteProjects = async () => {  
  const result = await Project.find({isFavourite : "true"});
  return result;
};


const updateFavouriteProjectIntoDB = async (id: string, payload: Partial<TProjuct>) => {
  try {
    const updateData = { ...payload };   

    if (payload.isFavourite === "favourite") {
      delete updateData.isFavourite;
      await Project.updateOne(
        { _id: id },
        { $unset: { isFavourite: "" } }
      );
    } else {
      await Project.updateOne(
        { _id: id },
        { $set: { isFavourite: true } }
      );
    }
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

const updateMainProjectsSingleDataIntoDB = async (id : string , payload : Partial<TProjuct> ) =>{
  const result =  await Project.findByIdAndUpdate(id, payload, {
    new : true,
    runValidators : true
  })
  return result
}

const updateProjectIntoDB = async (id: string, keyName : string , payload: Partial<TProjuct>) => {  
  const update = { [keyName]: payload };
  const updatedProject = await Project.findByIdAndUpdate(id, update, {
    new: true, 
    runValidators: true,
  });
  return updatedProject
};

const deleteProjectsIntoDB = async (payload : any ) => {
  try {
    if (!Array.isArray(payload) || !payload.every(id => typeof id === 'string')) {
      throw new Error('Invalid payload format');
    }
    const objectIds = payload.map(id => new mongoose.Types.ObjectId(id));

    const result = await Project.deleteMany({ _id: { $in: objectIds } });
    return result;
  } catch (error) {
    console.error('Error deleting projects:', error);
    throw error;
  }
};


export const ProjectsServices = {
  addProjectIntoDB,
  totalDataCountIntoDB,
  getAllProjects,
  duplicateDataIntoDB,
  deleteProjectsIntoDB,
  getAllFavouriteProjects,
  updateMainProjectsSingleDataIntoDB,
  updateFavouriteProjectIntoDB,
  updateProjectIntoDB,
};
