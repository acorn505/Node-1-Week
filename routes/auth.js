//routes/auth.js

const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const User = require("../schemas/user");

// 로그인 API
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  const user = await User.findOne({nickname});
  console.log(user)

  // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다.
  // 1. 이메일에 일치하는 유저가 존재하지 않거나
  // 2. 유저를 찾았지만, 유저의 비밀번호, 입력 비밀번호 다를때 
  if (!user) {
    res.status(412).json({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  } else if (!nickname || !password || password !== user.password) {
    res.status(400).json({
      errorMessage: "로그인에 실패햐였습니다.",
    });
    return;
  } 

  const token = jwt.sign(
    { userId: user.userId },
    "custom-secret-key",
  );

  res.cookie("Authorization", `Bearer ${token}`); // JWT를 Cookie로 할당합니다!
  res.status(200).json({ "token" : token }); // JWT를 Body로 할당합니다!
});

module.exports = router;