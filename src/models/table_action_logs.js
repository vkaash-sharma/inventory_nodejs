module.exports = (sequelize, DataTypes) => {
  const TableActionLog = sequelize.define("table_action_logs", {
    subModuleName: {
      type: DataTypes.STRING,
    },
    action: {
      type: DataTypes.STRING,
    },
    refrence_id: {
      type: DataTypes.INTEGER,
    },
    commit_id: {
      type: DataTypes.STRING,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });

  TableActionLog.associate = function (models) {
    TableActionLog.hasMany(models.table_change_logs, {
      foreignKey: "action_log_id",
      as: "actionChangeLogsDetails",
    });
  };

  return TableActionLog;
};
