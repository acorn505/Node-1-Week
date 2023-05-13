const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const { posts } = require("../models");
const { v4: uuidv4 } = require('uuid');


//const Posts = require("../schemas/posts.js");
// 1. 게시글 생성 API 
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
      //const postId = new mongoose.Types.ObjectId();
      const postId = uuidv4();
      console.log(postId);
      const createdAt = new Date();
      const updatedAt = new Date();

      const createdPosts = await posts.create({postId, UserId : userId, title, content, createdAt, updatedAt});
      //const createdPosts = await Posts.create({UserId : userId, title, content});
      return res.status(201).json({message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
      console.log(error)
      return res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 2. 게시글 조회 API 
router.get("/posts", async (req,res) => {
  const findAllData = await posts.findAll({
    attributes: ["postId", "title", "createdAt", "updatedAt"],
    order: [['createdAt', 'DESC']],
  });

  if (findAllData) { 
    res.status(200).json({ result:findAllData}); 
  } else {
    res.status(404).json({ errorMessage:"게시글 조회에 실패하였습니다."});
  }
});

// 3. 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const {postId} = req.params;
  try {
  const result = await posts.findOne({
    attributes: ['postId', 'title', 'content', 'createdAt', 'updatedAt'],
    where: {postId}
  });

  if (result) {
    res.status(200).json({"detail":result});
  } else {
    return res.status(400).json({success: false, errorMessage: "게시글 조회에 실패하였습니다." });
  } 

  } catch (error) {
    console.log(error)
    return res.status(400).json({success: false, errorMessage: "2 게시글 조회에 실패하였습니다."});
  };

}); 

// 4. 게시글 수정 API
router.put("/posts/:postId", authMiddleware, async(req,res) => {
  const {userId} = res.locals.user; 
  const {postId} = req.params;
  const {title, content} = req.body;

  const existsPost = await posts.findOne({postId:postId});

  console.log(existsPost)
 try {
  if (existsPost) { 
        // error
  if (userId !== existsPost.UserId) {
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

  if (userId === existsPost.UserId) {
    const updatedAt = new Date();
    //await posts.update(
    //   {postId: postId},
    //   { $set: { title, content, updatedAt} },
    //   );
    await posts.update(
        { title, content, updatedAt },
        { where: { postId } }
      );
      
     res.status(200).json({message: "게시글을 수정하였습니다."});
    } 
 else {
   return res.status(401).json({ message: "게시글이 정상적으로 수정되지 않았습니다." })
 }};

 } catch (error) {  
  console.log(error)
   return res.status(400).json({success: false, errorMessage: "게시글 수정에 실패하였습니다." });
 };

});

// 5. 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async(req, res) => {
  const { userId } = res.locals.user;
  const { postId} = req.params;

  const existsPost = await posts.findOne({postId:postId});

  try {
    if (existsPost) { 
    if (userId !== existsPost.UserId) {
      return res.status(403).json({ errorMessage: "게시글 삭제 권한이 존재하지 않습니다." });
    }
    
    if (!req.cookies) {
      return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    
    if (req.cookies.refreshToken || req.cookies.sessionId) {
      return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }
  
    if (userId === existsPost.UserId) {
      await posts.destroy({ where: { postId: postId } });
      res.status(200).json({message: "게시글을 삭제하였습니다."});
      } 
   else {
     return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
   }};
  
   } catch (error) {  
     console.log(error);
     return res.status(400).json({success: false, errorMessage: "게시글 삭제에 실패하였습니다." });
   };
  
});


module.exports = router;


