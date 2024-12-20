import BulkUpload from "./bulkUpload.model"

const getBulkUploadHistoryFromDB = async () => {
    const result = await BulkUpload.aggregate([
        {
            $addFields: {
                totalUploads: {
                    $add: [{ $size: '$withError' }, { $size: '$successData' }]
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$successData',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup:{
                from: 'products',
                localField: 'successData._id',
                foreignField:'_id',
                as:'productDetials'
            }
        },
        {
            $unwind: {
                path: '$productDetials',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
              _id: '$_id',
              createdBy: { $first: '$createdBy' },
              withError: { $first: '$withError' },
              successData: { $push: '$successData' },
              totalUploads: { $first: '$totalUploads' }
            }
          }
    ])
    return result
}

export const BulkUploadHistoryServices = {
    getBulkUploadHistoryFromDB
}