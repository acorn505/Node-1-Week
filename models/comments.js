'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1. Posts 모델에서
      this.belongsTo(models.users, { // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'userId', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'UserId', // 4. Comments 모델의 UserId 컬럼과 연결합니다.
      });

      // 1. Posts 모델에서
      this.hasMany(models.posts, { // 2. Comments 모델에게 1:N 관계 설정을 합니다.
        sourceKey: 'PostId', // 3. Posts 모델의 postId 컬럼을
        foreignKey: 'postId', // 4. Comments 모델의 PostId 컬럼과 연결합니다.
      });
    }
  }

  comments.init(
    {
      commentId: {
        allowNull: false, // NOT NULL
        autoIncrement: true, // AUTO_INCREMENT
        primaryKey: true, // Primary Key (기본키)
        type: DataTypes.INTEGER,
      },
      PostId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'posts',
          key: 'postId',
          onDelete: 'CASCADE',
        },
      },
      UserId: {
        allowNull: false, // NOT NULL
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'userId',
          onDelete: 'CASCADE',
        },
      },
      comment: {
        allowNull: false, // NOT NULL
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'comments',
    }
  );
  return comments;
};