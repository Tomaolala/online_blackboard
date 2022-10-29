package com.obb.online_blackboard.service;

import com.obb.online_blackboard.entity.RoomEntity;
import com.obb.online_blackboard.entity.SheetEntity;
import com.obb.online_blackboard.exception.OperationException;
import com.obb.online_blackboard.model.RoomModel;
import com.obb.online_blackboard.model.SheetModel;
import org.springframework.stereotype.Service;
import tool.util.MessageUtil;

import javax.annotation.Resource;

/**
 * @author 陈桢梁
 * @desc SheetService.java
 * @date 2022-10-29 10:35
 * @logs[0] 2022-10-29 10:35 陈桢梁 创建了SheetService.java文件
 */
@Service
public class SheetService {

    @Resource
    SheetModel sheetModel;

    @Resource
    RoomModel roomModel;

    @Resource
    MessageUtil messageUtil;

    public SheetEntity createSheet(String roomId, String name, long userId){
        RoomEntity room = roomModel.getRoomById(roomId);
        if(room.getCreatorId() != userId){
            throw new OperationException(403, "非房间创建者不能创建画布");
        }
        if(!room.getStatus().equals("meeting")){
            throw new OperationException(403, "会议已经结束或者还未开始");
        }
        SheetEntity sheet = sheetModel.createSheet(name);
        room.getSheets().add(sheet.getId());
        messageUtil.sendParticipants(room.getParticipants(), "/addSheet", sheet);
        roomModel.saveRoom(room);
        return sheet;
    }

}
