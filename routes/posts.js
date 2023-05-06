const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const mongoose = require("mongoose");
// 1. 게시글 작성 API
// Q. 여기서 잘못된 것이 무엇인지 알아보기 
// const Posts = require("../schemas/posts.js");
// router.post("/posts", async (req, res) => {
// 	const {user, password, title, content} = req.body;

//   if(!user || !password || !title || !content) {
//     return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
//   };

//   const postId = Math.random().toString(36).slice(-8);
//   const createdAt = new Date();
//   const createdPosts = await Posts.create({user, password, title, content, postId, createdAt});

//   res.json({message: "게시글을 생성하였습니다."});
// });

const Posts = require("../schemas/posts.js");
router.post("/posts", authMiddleware, async (req, res) => {
  const {userId, nickname} = res.locals.user;
	const {title, content} = req.body;

  if (!title && !content) {
    return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
  } else if (!title && content) {
    return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." })
  } else if (title && !content) {
    return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." })
  }

  if (!req.cookies) {
      return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
  if (req.cookies.refreshToken || req.cookies.sessionId) {
      return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

  try {
      const postId = new mongoose.Types.ObjectId();
      console.log(postId);
      const createdAt = new Date();
      const updatedAt = new Date();

      const createdPosts = await Posts.create({userId, postId, nickname, title, content, createdAt, updatedAt});
      return res.status(201).json({message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
      console.log(error)
      return res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 2. 게시글 조회 API 
// router.get("/posts", async (req,res) => {
//   const findAllData = await Posts.find({});
//   res.status(200).json({ result:findAllData})
// });

router.get("/posts", async (req,res) => {
  const findAllData = await Posts.find({}).sort({createdAt:-1});
  if (findAllData) {
    res.status(200).json({ result:findAllData}); 
  } else {
    res.status(404).json({ errorMessage:"게시글 조회에 실패하였습니다."});
  }
});

// 3. 게시글 상세 조회 API
router.get("/posts/:_postId", async (req, res) => {
  const {_postId} = req.params;
  try {
  const result = await Posts.findOne({postId: _postId})

  if (result) {
    res.status(200).json({"detail":result});
  } else {
    return res.status(400).json({success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  } 

  } catch (error) {
    return res.status(400).json({success: false, errorMessage: "게시글 조회에 실패하였습니다."});
  };

}); 

// 4. 게시글 수정 API
// router.put("/posts/:_postId", async(req,res) => {
//    const {_postId} = req.params;
//    const {password, title, content} = req.body;

//    const existsPost = await Posts.findOne({postId:_postId});

//    console.log(existsPost.password)

//   if(!password || !title || !content) {
//     return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });    
//   }
  
//   try {
//    if (existsPost) {
//     if (existsPost.password === password) {
//      await Posts.updateOne(
//         {postId: _postId},
//         {content, title},
//         );
//       res.status(201).json({message: "게시글을 수정하였습니다."});
//      } 
//   else {
//     return res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
//   }};

//   } catch (error) {  
//     return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
//   };

// });

router.put("/posts/:_postId", authMiddleware, async(req,res) => {
  const {userId} = res.locals.user; 
  const {_postId} = req.params;
  const {title, content} = req.body;

  const existsPost = await Posts.findOne({postId:_postId});

  console.log(existsPost)

 try {
  if (existsPost) { 
        // error
  if (userId !== existsPost.userId) {
    return res.status(403).json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
  }
  
  if (!(title && content)) {
    return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  } else if (!title && content) {
    return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  } else if (title && !content) {
    return res.status(412).json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  if (!req.cookies) {
    return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
  }
  
  if (req.cookies.refreshToken || req.cookies.sessionId) {
    return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
  }

  if (userId === existsPost.userId) {
    const updatedAt = new Date();
    await Posts.updateOne(
       {postId: _postId},
       { $set: { title, content, updatedAt} },
       );
     res.status(200).json({message: "게시글을 수정하였습니다."});
    } 
 else {
   return res.status(401).json({ message: "게시글이 정상적으로 수정되지 않았습니다." })
 }};

 } catch (error) {  
   return res.status(400).json({success: false, errorMessage: "게시글 수정에 실패하였습니다." });
 };

});

// 5. 게시글 삭제 API
// router.delete("/posts/:_postId", async(req, res) => {
//   const {_postId} = req.params;
//   const {password} = req.body; 

//   const existsPost = await Posts.findOne({postId:_postId});

//   if (existsPost) {
//     if (existsPost.password === password) {
//     await Posts.deleteOne({postId:_postId});
//     res.json({message:"게시글을 삭제하였습니다."});
//     } else {
//       return res.status(404).json({success: false, errorMessage: "게시글 조회에 실패하였습니다." });
//     }
//   }

//   if(!password || !_postId) {
//     return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
//   };
// });

router.delete("/posts/:_postId", authMiddleware, async(req, res) => {
  const { userId } = res.locals.user;
  const {_postId} = req.params;

  const existsPost = await Posts.findOne({postId:_postId});

  try {
    if (existsPost) { 
    if (userId !== existsPost.userId) {
      return res.status(403).json({ errorMessage: "게시글 삭제 권한이 존재하지 않습니다." });
    }
    
    if (!req.cookies) {
      return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    
    if (req.cookies.refreshToken || req.cookies.sessionId) {
      return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }
  
    if (userId === existsPost.userId) {
      await Posts.deleteOne({postId: _postId});
      res.status(200).json({message: "게시글을 수정하였습니다."});
      } 
   else {
     return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
   }};
  
   } catch (error) {  
     return res.status(400).json({success: false, errorMessage: "게시글 삭제에 실패하였습니다." });
   };
  
});


module.exports = router;


