package com.obb.online_blackboard.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.obb.online_blackboard.entity.base.Date;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * @author 陈桢梁
 * @desc RoomEntity.java
 * @date 2022-10-27 15:27
 * @logs[0] 2022-10-27 15:27 陈桢梁 创建了RoomEntity.java文件
 */
@Data
public class RoomSettingEntity extends Date {

    private String id;

    private String roomId;

    private long creatorId;

    private String name;

    // 1:成员可以编辑 0:成员不能编辑
    @Max(value = 1)
    @Min(value = 0)
    private int isShare;

    @Max(value = 1)
    @Min(value = 0)
    private int allowAnonymous;

    @NotNull
    @JsonFormat(locale = "zh",timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm")
    private java.util.Date startTime;

    @NotNull
    @JsonFormat(locale = "zh",timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm")
    private java.util.Date endTime;

}
