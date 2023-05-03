const express = require('express');
const router = express.Router();

// 1. 게시글 작성 API
const Posts = require("../schemas/posts.js");
router.post("/posts", async (req, res) => {
	const {user, password, title, content} = req.body;

  if(!user || !password || !title || !content) {
    return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  };

  const postId = Math.random().toString(36).slice(-8);
  const createdAt = new Date();
  const createdPosts = await Posts.create({user, password, title, content, postId, createdAt});

  res.json({message: "게시글을 생성하였습니다."});
});

// 2. 게시글 조회 API
router.get("/posts", async (req,res) => {
  const findAllData = await Posts.find({});
  res.status(200).json({ result:findAllData})
});

// 3. 게시글 상세 조회 API
router.get("/posts/:_postId", async (req, res) => {
  const {_postId} = req.params;
  try {
  const result = await Posts.findOne({postId: _postId})

  if (result) {
    res.status(200).json({"detail":result});
  } else {
    return res.status(400).json({success: false, errorMessage: "게시글이 존재하지 않습니다." });
  }

  } catch (error) {
    return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다."});
  };

}); 

// 4. 게시글 수정 API
router.put("/posts/:_postId", async(req,res) => {
   const {_postId} = req.params;
   const {password, title, content} = req.body;

   const existsPost = await Posts.findOne({postId:_postId});

   console.log(existsPost.password)

  if(!password || !title || !content) {
    return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });    
  }
  
  try {
   if (existsPost) {
    if (existsPost.password === password) {
     await Posts.updateOne(
        {postId: _postId},
        {content, title},
        );
      res.status(201).json({message: "게시글을 수정하였습니다."});
     } 
  else {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." })
  }};

  } catch (error) {  
    return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  };

});

// 5. 게시글 삭제 API
// -> 질문 
router.delete("/posts/:_postId", async(req, res) => {
  const {_postId} = req.params;
  const {password} = req.body; 

  const existsPost = await Posts.findOne({postId:_postId});

  if (existsPost) {
    if (existsPost.password === password) {
    await Posts.deleteOne({postId:_postId});
    res.json({message:"게시글을 삭제하였습니다."});
    } else {
      return res.status(404).json({success: false, errorMessage: "게시글 조회에 실패하였습니다." });
    }
  }

  if(!password || !_postId) {
    return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
  };
});


module.exports = router;


