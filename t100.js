/**
 * ? Tạo mới 1 tour: Collection t100
T100:
- dl146: Ngày create tour
- dl147: Người create tour
- t101: Object language của 1 tour
- tn120: Default tour trong nước
- tn123: Default tổng số ngày đi tour 
- tn127: Defaul tour un-publish
- tn134: Defaul tour không trả góp
- tv101: Mã của tour
- langPag: Language của trang
- currency: Đơn vị tiền tệ thanh toán của tour
- pb100: Id của business
- pp100: Id của trang
Result:
1. Insert data vào collection
2. Return data vừa insert

 */

/**
 * ? Thêm mới 1 ngôn ngữ vào tour: Collection t100
 */
db.t100.insertOne({
  dl146: new Date(),
  dl147: "quangthai@gmail.com",
  ft101: [
    {
      _id: new ObjectId(),
      tv151: "Tâm nè",
      lang: "en",
    },
  ],
  tn120: 0,
  tn123: 0,
  tn127: 0, // 0: unpulish, 1: publish
  tn134: 0,
  tv101: "Tâm nè TOUR",
  langPag: "vi",
  currency: "VND",
  pb100: "businessId",
  pp100: "pageId",
});

/**
 * ? Thêm mới 1 ngôn ngữ vào tour: Collection t100
 *
 */
db.t100.updateOne(
  {
    _id: ObjectId("63c0fe1b05b05ff450137170"),
  },
  {
    $push: {
      ft101: {
        _id: new ObjectId(),
        lang: "en",
        tv151: "Quang Tâm",
      },
    },
  }
);

db.t100.deleteMany({
  $and: [
    {
      _id: {
        $in: [
          ObjectId("63c0ccda05b05ff45013716a"),
          ObjectId("63c0ccee05b05ff45013716c"),
        ],
      },
    },
    { tn217: 1 },
  ],
});

/**
 * ? update many tn127: publish/unpublish
 */
db.t100.updateMany(
  {
    _id: {
      $in: [
        ObjectId("63c0ccfb05b05ff45013716e"),
        ObjectId("63c0fe1b05b05ff450137170"),
      ],
    },
  },
  {
    $set: {
      tn127: 1, // publish
      dl148: new Date(),
      user: {
        pn100: "123456",
        email: "quangthai@gmail.com",
      },
    },
  }
);

db.t100.find();

/**
 * ? thêm 1 dịch vụ của tour ftv104
 */
db.t100.updateOne(
  {
    _id: ObjectId("63c0ccfb05b05ff45013716e"),
  },
  {
    $push: {
      ftv104: {
        _id: new ObjectId(),
        name: "Dịch vụ 3",
        lang: "zh",
      },
    },
  }
);

/**
 * ? xoá 1 dịch vụ của tour ftv104
 */
db.t100.updateOne(
  {
    _id: ObjectId("63c0ccfb05b05ff45013716e"), // tourId
  },
  {
    $pull: {
      ftv104: {
        _id: new ObjectId("63c1222e05b05ff450137179"), // serviceId
      },
    },
  }
);

/**
 * ? update 1 document t100
 */
db.t100.updateOne(
  {
    _id: ObjectId("63c21e711974c31a14a00c9f"),
  },
  {
    $set: {
      dl148: new Date(), // ngày update
      dl149: "tam123@gmail.com", // email update
      tn120: 1,
      tn123: 2,
      tn127: 3,
      tn134: 4,
      tv101: "CODE TOUR QUANGTHAI",
      langPag: "english",
      currency: "USD",
      pb100: "businessId",
      pp100: "pageId",
      "ft101.$[x].tv151": "Tâm nè 123",
      "ft101.$[x].lang": "vi",
    },
  },
  {
    arrayFilters: [
      {
        "x.lang": "en",
      },
    ],
  }
);

/**
 * ? Query Aggregate: 
Input:
- idTour: Filter theo tour id
- lang: Filter theo tour language
Output: Thông tin tour từ T100, bao gồm:
- langPag: Language page
- currency: Đơn vị tiền tệ của tour
- ft101: List object language(t101) của 1 tour
- t101: Object language filter theo lang input
- t101_pag: Object language(t101) filter theo langPag
 * 
 */
db.t100.aggregate([
  {
    $match: {
      $and: [
        {
          _id: ObjectId("63c0fe1b05b05ff450137170"),
        },
        {
          tn127: 1,
        },
      ],
    },
  },
  {
    $project: {
      langPag: 1,
      currency: 1,
      ft101: 1,
      t101: {
        $filter: {
          input: "$ft101",
          cond: {
            $and: [
              {
                $eq: ["$$ft101.lang", "zh"],
              },
            ],
          },
          as: "ft101",
        },
      },
      t101_pag: {
        $filter: {
          input: "$ft101",
          cond: {
            $and: [
              {
                $eq: ["$$ft101.lang", "$langPag"],
              },
            ],
          },
          as: "ft101",
        },
      },
    },
  },
]);

/**
 * ? query Aggregate
 * * thống kê trên hệ thống có bao nhiêu tour, tổng số tour unpublish/publish,
 * * số lượng tour ngôn ngữ tiếng việt/en,
 * * số lượng tour trong nước/ngoài nước
 */
/**
 * C1: 1. project  T100, set field :
        count: 1
        publish: 1 nếu publish, ngược lại 0
        langEn: 1 nếu có lang en, ngược lại 0
        langVi: 1 nếu có lang vi, ngược lại 0
        domestic: 1 nếu là tour nội địa, ngược lại 0
        foreign: 1 nếu là tour nnước ngoài, ngược lại 0
      2. project tính sum cho từng field ở 1
 */
const english = "en";
const vietnam = "vi";
const domestic = 0;
const foreign = 1;
db.t100.aggregate([
  { $addFields: { total: 1 } },
  {
    $project: {
      total: 1, //Addfield
      publicTour: { $cond: [{ $eq: ["$tn127", 1] }, 1, 0] },
      unPublicTour: { $cond: [{ $eq: ["$tn127", 0] }, 1, 0] },
      langEn: { $cond: [{ $eq: ["$langPag", english] }, 1, 0] },
      langVi: { $cond: [{ $eq: ["$langPag", vietnam] }, 1, 0] },
      domestic: { $cond: [{ $eq: ["$tn120", domestic] }, 1, 0] },
      foreign: { $cond: [{ $eq: ["$tn120", foreign] }, 1, 0] },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$total" },
      publicTour: { $sum: "$publicTour" },
      unPublicTour: { $sum: "$unPublicTour" },
      langEn: { $sum: "$langEn" },
      langVi: { $sum: "$langVi" },
      domestic: { $sum: "$domestic" },
      foreign: { $sum: "$foreign" },
    },
  },
]);

/**
 * C2:  ? query Aggregate
 * ? use Facet
 */
db.t100.aggregate([
  {
    $facet: {
      total: [{ $count: "total" }],
      totalPublicTour: [
        { $match: { tn127: 1 } },
        { $count: "totalPublicTour" },
      ],
      totalDomestic: [
        { $match: { tn120: domestic } },
        { $count: "totalDomestic" },
      ],
      totalforeign: [
        { $match: { tn120: foreign } },
        { $count: "totalforeign" },
      ],
      totalUnPublicTour: [
        { $match: { tn127: 0 } },
        { $count: "totalUnPublicTour" },
      ],
      totalLangVi: [{ $match: { langPag: "vi" } }, { $count: "totalLangVi" }],
      totalLangEn: [{ $match: { langPag: "en" } }, { $count: "totalLangEn" }],
    },
  },
  {
    $project: {
      total: { $first: "$total.total" },
      totalLangVi: { $first: "$totalLangVi.totalLangVi" },
      totalLangEn: { $first: "$totalLangEn.totalLangEn" },
      totalPublicTour: { $first: "$totalPublicTour.totalPublicTour" },
      totalUnPublicTour: { $first: "$totalUnPublicTour.totalUnPublicTour" },
      totalDomestic: { $first: "$totalDomestic.totalDomestic" },
      totalForeign: { $first: "$totalforeign.totalforeign" },
    },
  },
]);

/**
 * ? pagination with aggregate
 * ? Query Aggregate: 
Input:
- id: Truờng hợp filter theo tourId
- deleted: Trường hợp  filter deleted tồn tại
-  turNm: Trường hợp filter tour name
Output: Bao gồm:
- data: List Object được offset + limit bao gồm:
  + tv101: Mã tour
  + pp100: Page id
  + t102: Logo(Object media)
  + t101: Object language tour filter theo lang
- total: Tổng record filter
 */

const skip = 2; //Default > 0
const limit = 2; //Default
const offset = (skip - 1) * limit;

db.t100.aggregate([
  {
    $match: {
      $and: [
        { dl148: { $exists: true } },
        { "ft101.tv151": { $regex: new RegExp("Tâm", "i") } },
      ],
    },
  },
  {
    $sort: { dl146: -1 },
  },
  {
    $project: {
      tv101: 1,
      pp100: 1,
      pb100: 1,
      t102: 1,
      t101: {
        $filter: {
          input: "$ft101",
          as: "ft101",
          cond: {
            $regexMatch: {
              input: "$$ft101.tv151",
              regex: "Tâm",
              options: "i",
            },
          },
        },
      },
    },
  },
  {
    $facet: {
      data: [{ $skip: offset }, { $limit: limit }],
      metadata: [
        { $count: "totalResults" },
        {
          $addFields: {
            page: skip,
            limit: limit,
            totalPages: {
                $round: {
                    $divide: ["$totalResults", limit]
                }
            },
            totalResults: { $sum: "$totalResults" }
          },
        },
      ],
    },
  },
  {
    $project: {
      data: 1,
      metadata: { $arrayElemAt: ["$metadata", 0] },
    },
  },
]);

/**
 * ? query Aggregate
 * Input:
- fId: Filter theo list tour id
- lang: Filter theo tour language
Output: Bao gồm:
- _id: tour id
- tv101: Mã tour
- t102: Logo(Object media)
- pp100: page id
- t101: Object language tour filter theo lang input
 */
db.t100.aggregate([
  {
    $match: {
      _id: {
        $in: [
          ObjectId("63c0ccfb05b05ff45013716e"),
          ObjectId("63c0fe1b05b05ff450137170"),
          ObjectId("63c21e711974c31a14a00c9f"),
        ],
      },
    },
  },
  {
    $project: {
      _id: { $toString: "$_id" },
      tv101: 1,
      t102: 1,
      pp100: 1,
      t101: {
        $filter: {
          input: "$ft101",
          cond: {
            $and: [
              {
                $eq: ["$$ft101.lang", "en"],
              },
            ],
          },
          as: "ft101",
        },
      },
    },
  },
  {
    $facet: {
      data: [{ $skip: offset }, { $limit: limit }],
      metadata: [
        { $count: "totalResults" },
        {
          $addFields: {
            page: skip,
            limit: limit,
            totalPages: {
              $round: {
                $divide: ["$totalResults", limit],
              },
            },
            totalResults: "$totalResults",
          },
        },
      ],
    },
  },
  {
    $project: {
      data: 1,
      metadata: { $arrayElemAt: ["$metadata", 0] },
    },
  },
]);
