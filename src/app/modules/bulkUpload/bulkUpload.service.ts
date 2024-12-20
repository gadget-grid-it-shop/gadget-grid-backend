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
        }
    ])
    return result
}

export const BulkUploadHistoryServices = {
    getBulkUploadHistoryFromDB
}