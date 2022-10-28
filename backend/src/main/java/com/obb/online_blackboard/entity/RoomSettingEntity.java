package com.obb.online_blackboard.entity;

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

    @Max(value = 1)
    @Min(value = 0)
    private int isShare;

    @Max(value = 1)
    @Min(value = 0)
    private int allowAnonymous;

    @NotNull
    private java.util.Date startTime;

    @NotNull
    private java.util.Date endTime;

}
