const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth-middleware");
const { comments } = require("../models");
const { posts } = require("../models");
const { v4: uuidv4 } = require('uuid');


// 6. 댓글 생성 
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const {userId} = res.locals.user;
    const {postId} = req.params;
    const {content} = req.body 

    const post = await posts.findOne({ postId: postId })

    if (!post) {
        return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
    }
    // 댓글 형식
    if (!content) {
        return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
    }

     
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (req.cookies.refreshToken || req.cookies.sessionId) {
        return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    const commentId = uuidv4();
    createdAt = new Date()

    try { 
        await comments.create({commentId, PostId: postId, UserId :userId, comment: content, createdAt})
        return res.status(201).json({ message: "댓글을 생성하였습니다." })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
});


// 7. 댓글 목록 조회
router.get("/posts/:postId/comments", async (req, res) => {
    const {postId} = req.params;
    const post = await posts.findOne({ postId: postId });

    if (!post) {
        return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
    }

    try {
        const commentsAll = await comments.findAll({
            attributes: ["commentId","postId", "UserId", "comment", "createdAt", "updatedAt"],
            order: [['createdAt', 'DESC']],
          });
        return res.status(200).json({result: commentsAll});
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

}); 


// 8. 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async(req,res) => {
    const {userId} = res.locals.user
    const {postId} = req.params;
    const {commentId} = req.params;
    const {comment} = req.body;
  
    if (!comment) {
        return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
    };
    
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (req.cookies.refreshToken || req.cookies.sessionId) {
        return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }


    try {
        const existsPost = await posts.findOne({ postId: postId });
        const existsComments = await comments.findOne({commentId:commentId});
        console.log(existsComments)
        if (existsPost && existsComments) {
            if (existsComments.UserId === userId) {
                const updatedAt = new Date();
                await comments.update(
                    { comment, updatedAt },
                    { where: { commentId } }
                  );
                return res.status(201).json({ message: "댓글을 수정하였습니다." })

            } else {
                return res.status(401).json({ message: "댓글 조회에 실패하였습니다." })
            }
        } else if (!existsPost) {
            return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
        } else if (existsPost && !existsComments) {
            return res.status(404).json({ message: "댓글이 존재하지 않습니다." })
        };

    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "댓글 수정에 실패하였습니다." })
    }
   
    });
    
// 9. 댓글 삭제
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async(req, res) => {
    const {userId} = res.locals.user;
    const {postId} = req.params;
    const {commentId} = req.params;
    
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (req.cookies.refreshToken || req.cookies.sessionId) {
        return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    try {
        const existsPost = await posts.findOne({ postId: postId });
        const existsComments = await comments.findOne({commentId:commentId});
        console.log(existsComments)
        if (existsPost && existsComments) {
            if (existsComments.UserId === userId) {
                await  comments.destroy({ where: { commentId: commentId } });
                return res.status(200).json({ message: "댓글을 삭제하였습니다." })

            } else {
                return res.status(403).json({ message: "댓글의 삭제 권한이 존재하지 않습니다." })
            }
        } else if (!existsPost) {
            return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
        } else if (existsPost && !existsComments) {
            return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." })
        };

    } catch (error) {
        return res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." })
    }
   
   });
   
  module.exports = router;
  
  