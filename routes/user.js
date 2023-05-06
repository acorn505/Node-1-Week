// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const authMiddleware = require("../middleware/auth-middleware");
const JWT = require("jsonwebtoken");

// routes/users.js
// 내 정보 조회 API
// 내 정보 조회 API 에서 질문 -> me 에 뭐가 들어가야하는지?
router.get("/users/me", authMiddleware, async (req, res) => {
  const { nickname, _id } = res.locals.user;
  
  res.status(200).json({
    user: { nickname , _id}
  });
});


// 회원가입 API
router.post("/signup", async (req, res) => {
  const {nickname, password, confirmPassword } = req.body;

  const regex_nickname = /^[a-zA-Z0-9]{3,}$/; // 정규식
  const regex_password = new RegExp("^(?!.*" + nickname + ").*[a-zA-Z0-9]{4,}$");

  if (password !== confirmPassword) {
    res.status(412).json({
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
    return;
  } else if (!regex_nickname.test(nickname)) {
    res.status(412).json({
      errorMessage: "닉네임의 형식이 일치하지 않습니다.",
    });
    return;
  } else if (password.length < 3) {
    res.status(412).json({
      errorMessage: "패스워드 형식이 일치하지 않습니다.",
    });
    return;
  } else if (!regex_password.test(password)) {
    res.status(412).json({
      errorMessage: "패스워드에 닉네임이 포함되어 있습니다.",
    });
    return;
  } else if (!nickname || !password || !confirmPassword ) {
    res.status(400).json({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }

  // email 또는 nickname이 동일한 데이터가 있는지 확인하기 위해 가져온다.
  const existsUsers = await User.findOne({
    $or: [{ nickname }],
  });

  if (existsUsers) {
    // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
    res.status(412).json({
      errorMessage: "중복된 닉네임입니다.",
    });
    return;
  }

  const user = new User({ nickname, password });
  await user.save();

  res.status(201).json({message: "회원가입에 성공하셨습니다."});
});


module.exports = router;