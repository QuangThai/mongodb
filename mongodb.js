
    /*
    |--------------------------------------------------------------------------
    | 1. COLLECTIONS
    |--------------------------------------------------------------------------
    */

/** 
Tạo các collection sau:
1. Person
	firstName: họ
	lastName: tên
	age: tuổi
	sex: giới tính
	languages: ngôn ngữ sử dụng
	verhicles: phương tiện đã và đang sử dụng
		type: loại phương tiện
		status: trạng thái sử dụng
2. Company
	names: tên cty
		lang: ngôn ngữ
		name: tên cty theo ngôn ngữ 
	code: mã cty
	address: địa chỉ cty
	employeeNumb: số lượng nhân viên
	categories: ngành nghề đăng ký
	currency: đơn vị tiền tệ trả lương cho công ty
3. Employee:
	personId: id của person làm trong cty
	companyId: id của công ty
	salary: mức lương cty trả cho person
	startDate: ngày vào làm
	salary: mức lương cty trả cho person
	currency: đơn vị tiền tệ cty trả cho person

*/

  /*
    |--------------------------------------------------------------------------
    | 2. QUERY
    |--------------------------------------------------------------------------
    */

// 1. Viết query insert đầy đủ data của 1 document trong collection person
db.Person.insertOne({
  firstName: "Tâm",
  lastName: "Nguyễn",
  emails: [
    {
      note: "tâm email",
      emailName: "tam@gmail.com",
      status: 1,
    },
  ],
  phones: ["12345789", "147258369"],
  birthday: "1998-15-09",
  age: "24",
  sex: "male",
  info: [
    {
      idCard: "1",
      address: "Thừa Thiên Huế",
      status: 1,
    },
  ],
  langs: [
    {
      name: "vi",
      level: "Toiec",
      certificate: ["giỏi", "khá"],
    },
  ],
});

// 2. Viết query update thêm 1 language của 1 person
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $push: {
      langs: {
        name: "en",
        level: "ielts 10.0",
        certificate: ["Xuất sắc"],
      },
    },
  }
);

// 3. Viết query xoá 1 language của 1 person
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $pull: {
      langs: {
        name: "en",
      },
    },
  }
);

// 4. Viết query update thêm 1 info của 1 person
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $push: {
      info: {
        idCard: "1",
        address: "Huế",
        status: false,
      },
    },
  }
);

// 5. Viết query update CMND của 1 user thành deactive (ko còn sử dụng nữa)
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $set: { "info.$[x].status": false },
  },
  {
    arrayFilters: [{ "x.idCard": "1" }],
  }
);

// 6. Viết query xoá 1 info của 1 person
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $pull: {
      info: {
        idCard: "1",
      },
    },
  }
);

// 7. Viết query update họ/tên/language/info của 1 person
db.Person.updateOne(
  {
    _id: ObjectId("63808fb38916ee2c4b77b478"),
  },
  {
    $set: {
      firstName: "Quang Thái",
      lastName: "Nguyễn",
      "info.$[x].address": "Hà Nội",
      "info.$[x].status": true,
      "langs.$[y].name": "vi",
      "langs.$[y].level": "ielts 4.0",
      "langs.$[y].certificate": ["trung bình", "giỏi"],
    },
  },
  {
    arrayFilters: [{ "x.idCard": "1" }, { "y.name": "en" }],
  }
);

// 8. Viết query cập nhật giới tính của toàn bộ document trong collection person sang NA (Chưa xác định)
db.Person.updateMany(
  {},
  {
    $set: {
      sex: "NA",
    },
  }
);

// 9. Viết query đếm trong collection person có bao  nhiêu sdt
db.Person.aggregate([
  {
    $unwind: "$phones",
  },
  {
    $group: {
      _id: null,
      count: {
        $sum: 1,
      },
    },
  },
]);

// 10. Viết query get toàn bộ language hiện có trong collection person (kết quả ko được trùng nhau)
db.Person.aggregate([
  {
    $unwind: "$langs",
  },
  {
    $group: { _id: "$langs.name" },
  },
  {
    $project: {
      _id: 1,
    },
  },
]);

// 11. Viết query get những person có tên chứa "Nguyễn" và ngày sinh trong khoảng tháng 2~ tháng 10
db.Person.aggregate([
  {
    $addFields: {
      month: { $month: "$birthday" },
    },
  },
  {
    $match: {
      $and: [
        { fullName: { $regex: new RegExp(/.*Nguyễn*./, "i") } },
        { month: { $gte: 2 } },
        { month: { $lte: 9 } },
      ],
    },
  },
  {
    $project: {
      fullName: 1,
      month: 1,
      sex: 1,
    },
  },
]);

// 12. Viết query get thông tin của toàn bộ person có giới tính là nam + language là "Tiếng Việt", yêu cầu:
//    - Group theo fullname (họ + tên)
//   - Kết quả trả về bao gồm:
//        + fullname (họ + tên)
//       + sdt
//       + language (chỉ hiển thị language "Tiếng Việt")
//       + email (chỉ hiển thị những email có đuôi là @gmail.com)
db.Person.aggregate([
  {
    $match: {
      $and: [
        { sex: "male" },
        { "langs.name": "vi" },
        { "emails.emailName": { $regex: new RegExp("@gmail", "i") } },
      ],
    },
  },
  {
    $project: {
      fullName: {
        $concat: ["$firstName", " ", "$lastName"],
      },
      phones: 1,
      langs: {
        $filter: {
          input: "$langs",
          as: "lang",
          cond: { $eq: ["$$lang.name", "vi"] },
        },
      },
      emails: {
        $filter: {
          input: "$emails",
          as: "email",
          cond: {
            $regexMatch: {
              input: "$$email.emailName",
              regex: /@gmail.com/,
            },
          },
        },
      },
    },
  },
]);

// 13. Tương tự số 12, nhưng trả về thêm tổng số record thoả yêu cầu + tổng số record hiện có trong collection person
db.Person.aggregate([
  {
    $facet: {
      totalMatch: [
        {
          $match: {
            $and: [
              { sex: "male" },
              { "langs.name": "vi" },
              { "emails.emailName": { $regex: new RegExp("@gmail", "i") } },
            ],
          },
        },
        {
          $count: "totalMatch",
        },
      ],
      totalRecord: [{ $count: "totalRecord" }],
    },
  },
  {
    $project: {
      totalRecord: { $arrayElemAt: ["$totalRecord.totalRecord", 0] },
      totalMatch: { $arrayElemAt: ["$totalMatch.totalMatch", 0] },
    },
  },
]);

// 14. Viết query update toàn bộ person , thêm field fullName = firstName + lastName
db.Person.updateMany({}, [
  {
    $set: {
      fullName: {
        $concat: ["$firstName", " ", "$lastName"],
      },
    },
  },
]);

// 15. Viết query update 1 person, gồm :
//	3.1 set age = 30
//	3.2 set 1 verhicle trong verhicles  thành ko sử dụng
//	3.2 thêm mới 1 language trong languages
db.Person.updateOne(
  { _id: ObjectId("63808fb38916ee2c4b77b478") },
  {
    $set: {
      age: 30,
      "info.$[x].address": "Hà Nội",
      "info.$[x].status": true,
      "langs.$[y].name": "vi",
      "langs.$[y].level": "ielts 4.0",
      "langs.$[y].certificate": ["khá", "giỏi"],
    },
  },
  {
    arrayFilters: [{ "x.idCard": "1" }, { "y.name": "en" }],
  }
);

// 16. Thống kê có bao nhiêu công ty, số lượng nhân viên của mỗi công ty
db.Company.aggregate([
  {
    $facet: {
      totalCompany: [
        {
          $count: "totalCompany",
        },
      ],
      totalEmployess: [
        {
          $lookup: {
            from: "Employee",
            localField: "_id",
            foreignField: "companyId",
            as: "Employees",
          },
        },
        {
          $count: "totalEmployess",
        },
      ],
    },
  },
  {
    $project: {
      totalCompany: { $arrayElemAt: ["$totalCompany.totalCompany", 0] },
      totalEmployess: { $arrayElemAt: ["$totalEmployess.totalEmployess", 0] },
    },
  },
]);

// 17. Thống kê công ty A , vào năm 2022 có bao nhiêu nhân viên vào làm, tổng mức lương phải trả cho những nhân viên đó là bao nhiêu
db.Company.aggregate([
  {
    $lookup: {
      from: "Employee",
      localField: "_id",
      foreignField: "companyId",
      as: "employee",
    },
  },
  {
    $unwind: "$employee",
  },
  {
    $match: {
      $and: [
        { "names.name": { $regex: new RegExp("Quang Thái", "i") } },
        { $expr: { $eq: [{ $year: "$employee.startDate" }, 2022] } },
      ],
    },
  },
  {
    $group: {
      _id: "$_id",
      totalEmployee: { $sum: 1 },
      totalSalary: { $sum: "$employee.salary" },
    },
  },
]);

// 18. Thống kê tổng số tiền các công ty phải trả cho những người đăng ký vào làm trong năm 2022
db.Company.aggregate([
  {
    $lookup: {
      from: "Employee",
      localField: "_id",
      foreignField: "companyId",
      as: "employee",
    },
  },

  {
    $unwind: "$employee",
  },

  {
    $match: {
      $and: [{ $expr: { $eq: [{ $year: "$employee.startDate" }, 2022] } }],
    },
  },

  {
    $group: {
      _id: {
        id: "$_id",
        name: "$names.name",
      },
      totalEmployee: { $sum: 1 },
      totalSalary: { $sum: "$employee.salary" },
    },
  },
]);

// 19. Thống kê tổng số tiền các công ty IT phải trả cho những người đăng ký vào làm trong các năm từ 2020 ~ 2022
db.Company.aggregate([
  {
    $lookup: {
      from: "Employee",
      localField: "_id",
      foreignField: "companyId",
      as: "employee",
    },
  },

  {
    $unwind: "$employee",
  },

  {
    $match: {
      $expr: {
        $and: [
          { $gte: [{ $year: "$employee.startDate" }, 2020] },
          { $lte: [{ $year: "$employee.startDate" }, 2022] },
        ],
      },
    },
  },

  {
    $group: {
      _id: {
        id: "$_id",
        name: "$names.name",
      },
      totalSalary: { $sum: "$employee.salary" },
    },
  },
]);

// 20. Viết query insert 10000 document cho từng collection person/company/employee
const company = new Array(10000).fill({
  names: [
    {
      name: "Quang Bình",
      lang: "zh",
    },
  ],
  code: 147258,
  address: "Hà Nội",
  employeeNumb: 2,
  categories: [
    {
      id: 1,
      name: "Nghề chăn nuôi",
    },
  ],
  currency: "USD",
});

const person = new Array(10000).fill({
  firstName: "Tâm",
  lastName: "Nguyễn",
  emails: [
    {
      note: "tâm email",
      emailName: "tam@gmail.com",
      status: 1,
    },
  ],
  phones: ["12345789", "147258369"],
  birthday: "1998-15-09",
  age: "24",
  sex: "male",
  info: [
    {
      idCard: "1",
      address: "Thừa Thiên Huế",
      status: 1,
    },
  ],
  langs: [
    {
      name: "vi",
      level: "Toiec",
      certificate: ["giỏi", "khá"],
    },
  ],
});

const employee = new Array(10000).fill({
  personId: new ObjectId("63808fb38916ee2c4b77b478"),
  companyId: new ObjectId("638823a85f9a276d8e4f3c5a"),
  salary: 4000,
  startDate: ISODate("2022-12-01T11:03:51.384+07:00"),
  currency: "VND",
});

db.Employee.insertMany(employee);
db.Person.insertMany(person);
db.Company.insertMany(company);
