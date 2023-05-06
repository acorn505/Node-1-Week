// middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
    // 쿠키 정보 전달받기
  const { Authorization } = req.cookies;
    // Split 
    // ?? -> null 병합 연산자 
  const [authType, authToken] = (Authorization ?? "").split(" ");
    // (1) Bearer 토큰에 대한 검증
    // authType === Bearer값인지 확인
    // authToken이 비어있지 않은지 검증 
  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }

  // (2) authToken 이 만료되었는지 확인
  // authToken이 서버가 발급 토큰이 맞는지 검증
  // authToken에 있는 userId에 해당하는 사용자가 실제 DB에 존재하는지 확인 
  // 서버가 멈추지 않고 에러처리 하기 위해 try-catch 구문 사용 
  try {
    const { userId } = jwt.verify(authToken, "custom-secret-key");
    const user = await User.findById(userId);
    // local db 로 유저 전달 
    // response 보내고 나면 소멸 
    res.locals.user = user;
    // 미들웨어 다음으로 보낸다 
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }
};

