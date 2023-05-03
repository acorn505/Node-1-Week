const express = require("express")
const router = express.Router()

// 6. 댓글 생성 
const Comments = require("../schemas/comments.js");
router.post("/posts/:_postId/comments", async (req, res) => {
    const {_postId} = req.params;
    const { user, password, content } = req.body

    if (!content) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
    } else if (!_postId) {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

    const commentId = Math.random().toString(36).slice(-6);
    createdAt = new Date()

    const postId = _postId; 

    await Comments.create({commentId, user, password, content, postId, createdAt})
    return res.status(201).json({ message: "댓글을 생성하였습니다." })
});

// 7. 댓글 목록 조회
router.get("/posts/:_postId/comments", async (req, res) => {
    const {_postId} = req.params;

    try{
        const comments = await Comments.find({postId:_postId}).exec();
        return res.status(200).json({result: comments });
    } catch (error) {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
}); 

// 8. 댓글 수정
router.put("/posts/:_postId/comments/:_commentId", async(req,res) => {
    const {_postId} = req.params;
    const {_commentId} = req.params;
 
    const {password, content} = req.body;
  
    if (!content) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
    }
    
    try {
        const existsComments = await Comments.findOne({commentId:_commentId});
        console.log(existsComments)
        if (existsComments) {
            if (existsComments.password === password) {
                await Comments.updateOne({commentId: _commentId}, {$set:{content}})
                return res.status(201).json({ message: "댓글을 수정하였습니다." })

            } else {
                return res.status(401).json({ message: "댓글 조회에 실패하였습니다." })
            }
        } else {
            return res.status(404).json({ message: "댓글 조회에 실패하였습니다." })
        }

    } catch (error) {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }
   
    });

// 9. 댓글 삭제
router.delete("/posts/:_postId/comments/:_commentId", async(req, res) => {
    const {_postId} = req.params;
    const {_commentId} = req.params;
    const {password} = req.body;
    
    const existsComments = await Comments.findOne({commentId:_commentId});
    console.log(existsComments)
    if (existsComments) {
      if (existsComments.password === password) {
      await Comments.deleteOne({commentId:_commentId});
      res.json({message:"댓글을 삭제하였습니다."});
      } else {
        return res.status(404).json({success: false, errorMessage: "댓글 조회에 실패하였습니다." });
      }
    }
  
    if(!password || !_postId || !_commentId) {
      return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
    };
   })
  
  module.exports = router;
  