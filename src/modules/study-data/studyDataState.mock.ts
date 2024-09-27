import { StudyDataFileType } from "./studyData.enum"
export const studyDataStateMock = {
  "studyDataFileUpload":{
  },
  "studyDataLoading":{
    "isLoadingFolder":false,
    "isLoadingFile":false
  },
  "studyDataStage":{
    "current":{
      "studyData":{
        "studyId":"1",
        "parentId":"123",
        "id": "1",
        "name": "Test",
        "studyDataType": "STUDY"
      },
      "folders":[
        {
          "id":"123",
          "studyId":"test",
          "parentId":"root",
          "name":"Test",
          "studyDataType":"FOLDER"
        }
      ],
      "totalFolders":1,
      "folderPage":0,
      "folderSize":0,
      "files":[
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        },
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        },
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        },
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        },
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        },
        {
          "id":"id",
          "studyId":"test",
          "parentId":"id",
          "name":"name",
          "studyDataType":"string",
          "type":StudyDataFileType.UNSPECIFIED,
          "path":"path",
          "size":"0.00 B",
          "createdAt":"Wednesday, Sep 25, 2024"
        }
      ],
      "totalFiles":1,
      "filePage":0,
      "fileSize":4,
      "path":[
        "root",
        "Test"
      ],
      "pathLevel":2
    },
    "history":[
      {
        "studyData":{
          "studyId":"1",
          "parentId":"root",
          "id": "1",
          "name": "Test",
          "studyDataType": "STUDY"
        },
        "folders":[
          {
            "id":"123",
            "studyId":"test",
            "parentId":"root",
            "name":"Test",
            "studyDataType":"FOLDER"
          }
        ],
        "totalFolders":1,
        "folderPage":0,
        "folderSize":13,
        "files":[
          
        ],
        "totalFiles":0,
        "filePage":0,
        "fileSize":13,
        "path":[
          "root"
        ],
        "pathLevel":1
      },
      {
        "studyData":{
          "studyId":"1",
          "parentId":"root",
          "id": "1",
          "name": "Test",
          "studyDataType": "STUDY",
        },
        "folders":[
          {
            "id":"123",
            "studyId":"test",
            "parentId":"root",
            "name":"Test",
            "studyDataType":"FOLDER"
          }
        ],
        "totalFolders":1,
        "folderPage":0,
        "folderSize":0,
        "files":[
          
        ],
        "totalFiles":0,
        "filePage":0,
        "fileSize":13,
        "path":[
          "root"
        ],
        "pathLevel":1
      },
      {
        "studyData":{
          "studyId":"1",
          "parentId":"root",
          "id": "1",
          "name": "Test",
          "studyDataType": "STUDY",
        },
        "folders":[
          {
            "id":"123",
            "studyId":"test",
            "parentId":"root",
            "name":"Test",
            "studyDataType":"FOLDER"
          }
        ],
        "totalFolders":1,
        "folderPage":0,
        "folderSize":0,
        "files":[
          
        ],
        "totalFiles":0,
        "filePage":0,
        "fileSize":13,
        "path":[
          "root"
        ],
        "pathLevel":1
      }
    ],
    "historyIndex":1
  }
}