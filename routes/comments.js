const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth-middleware");
const mongoose = require("mongoose");

// 6. 댓글 생성 
// const Comments = require("../schemas/comments.js");
// router.post("/posts/:_postId/comments", async (req, res) => {
//     const {_postId} = req.params;
//     const { user, password, content } = req.body 

//     // 댓글 파라미터 없을 시 예외 처리 
//     if (!content) {
//         return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
//     } else if (!_postId) {
//         return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
//     }

//     const commentId = Math.random().toString(36).slice(-6);
//     createdAt = new Date()

//     const postId = _postId; 

//     await Comments.create({commentId, user, password, content, postId, createdAt})
//     return res.status(201).json({ message: "댓글을 생성하였습니다." })
// });

const Comments = require("../schemas/comments.js");
const Posts = require("../schemas/posts");
router.post("/posts/:_postId/comments", authMiddleware, async (req, res) => {
    const {userId, nickname} = res.locals.user;
    const {_postId} = req.params;
    const {content} = req.body 

    const post = await Posts.findOne({ postId: _postId })

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

    const commentId = new mongoose.Types.ObjectId();
    createdAt = new Date()

    const postId = _postId; 

    try { 
        await Comments.create({commentId, postId, userId, nickname, content, createdAt})
        return res.status(201).json({ message: "댓글을 생성하였습니다." })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
});



// 7. 댓글 목록 조회
router.get("/posts/:_postId/comments", async (req, res) => {
    const {_postId} = req.params;
    const post = await Posts.findOne({ postId: _postId });

    if (!post) {
        return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
    }

    try {
        const comments = await Comments.find({postId:_postId}).sort({createdAt:-1});
        return res.status(200).json({result: comments});
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
    }

}); 


// 8. 댓글 수정
// router.put("/posts/:_postId/comments/:_commentId", async(req,res) => {
//     const {_postId} = req.params;
//     const {_commentId} = req.params;
 
//     const {password, content} = req.body;
  
//     if (!content) {
//         return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
//     }
    
//     try {
//         const existsComments = await Comments.findOne({commentId:_commentId});
//         console.log(existsComments)
//         if (existsComments) {
//             if (existsComments.password === password) {
//                 await Comments.updateOne({commentId: _commentId}, {$set:{content}})
//                 return res.status(201).json({ message: "댓글을 수정하였습니다." })

//             } else {
//                 return res.status(401).json({ message: "댓글 조회에 실패하였습니다." })
//             }
//         } else {
//             return res.status(404).json({ message: "댓글 조회에 실패하였습니다." })
//         }

//     } catch (error) {
//         return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." })
//     }
   
//     });

router.put("/posts/:_postId/comments/:_commentId", authMiddleware, async(req,res) => {
    const {userId} = res.locals.user
    const {_postId} = req.params;
    const {_commentId} = req.params;
    const {content} = req.body;
  
    if (!content) {
        return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
    };
    
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (req.cookies.refreshToken || req.cookies.sessionId) {
        return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }


    try {
        const existsPost = await Posts.findOne({ postId: _postId });
        const existsComments = await Comments.findOne({commentId:_commentId});
        console.log(existsComments)
        if (existsPost && existsComments) {
            if (existsComments.userId === userId) {
                await Comments.updateOne({commentId: _commentId}, {$set:{content}})
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
        return res.status(400).json({ message: "댓글 수정에 실패하였습니다." })
    }
   
    });
    
// 9. 댓글 삭제
//router.delete("/posts/:_postId/comments/:_commentId", async(req, res) => {
//    const {_postId} = req.params;
//    const {_commentId} = req.params;
//    const {password} = req.body;
    
//    const existsComments = await Comments.findOne({commentId:_commentId});
//    console.log(existsComments)
//    if (existsComments) {
//      if (existsComments.password === password) {
//      await Comments.deleteOne({commentId:_commentId});
//      res.json({message:"댓글을 삭제하였습니다."});
//      } else {
//        return res.status(404).json({success: false, errorMessage: "댓글 조회에 실패하였습니다." });
//      }
//    }
  
//    if(!password || !_postId || !_commentId) {
//      return res.status(400).json({success: false, errorMessage: "데이터 형식이 올바르지 않습니다." });
//    };
//   })

router.delete("/posts/:_postId/comments/:_commentId", authMiddleware, async(req, res) => {
    const {userId} = res.locals.user;
    const {_postId} = req.params;
    const {_commentId} = req.params;
    
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }
    if (req.cookies.refreshToken || req.cookies.sessionId) {
        return res.status(401).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    try {
        const existsPost = await Posts.findOne({ postId: _postId });
        const existsComments = await Comments.findOne({commentId:_commentId});
        console.log(existsComments)
        if (existsPost && existsComments) {
            if (existsComments.userId === userId) {
                await Comments.deleteOne({commentId: _commentId})
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
  
  