module.exports = (sequelize, DataTypes) => {
    const TableChangeLog = sequelize.define('table_change_logs', {
        action_log_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tableName: {
            type: DataTypes.STRING,
        },
        refrenceId: {
            type: DataTypes.INTEGER,
        },
        fieldName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prevValue: {
            type: DataTypes.TEXT,
            defaultValue: '',
        },
        changeValue: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdBy: DataTypes.INTEGER,
        updatedBy: DataTypes.INTEGER,
        deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    })


    TableChangeLog.associate = function(models) {
        TableChangeLog.belongsTo( models.table_action_logs, {
            foreignKey : "action_log_id" ,
            as : "actionLogsDetails"
        }) 
    }

    
    return TableChangeLog
}
