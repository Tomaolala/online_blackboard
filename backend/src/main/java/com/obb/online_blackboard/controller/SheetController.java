package com.obb.online_blackboard.controller;

import com.obb.online_blackboard.entity.base.Shape;
import com.obb.online_blackboard.service.SheetService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestController;
import tool.annotation.JsonKey;
import tool.result.Message;

import javax.annotation.Resource;
import java.security.Principal;

/**
 * @author 陈桢梁
 * @desc SheetController.java
 * @date 2022-10-29 10:29
 * @logs[0] 2022-10-29 10:29 陈桢梁 创建了SheetController.java文件
 */
@RestController
public class SheetController {

    @Resource
    SheetService sheetService;

    @MessageMapping("/create")
    public void create(Principal principal, @JsonKey String name, @JsonKey long roomId){
        sheetService.createSheet(roomId, name, Long.parseLong(principal.getName()));
    }

    @MessageMapping("/draw")
    public void draw(Principal p, @JsonKey Shape shape, @JsonKey long roomId, @JsonKey long sheetId){
        sheetService.draw(Long.parseLong(p.getName()), shape, roomId, sheetId);
    }

    @MessageMapping("/redo")
    public void redo(Principal p, @JsonKey long roomId, @JsonKey long sheetId){
        sheetService.redo(Long.parseLong(p.getName()), roomId, sheetId);
    }

    @MessageMapping("/rollback")
    public void rollback(Principal p, @JsonKey long roomId, @JsonKey long sheetId){
        sheetService.rollback(Long.parseLong(p.getName()), roomId, sheetId);
    }

    @MessageMapping("/modify")
    public void modify(Principal p, @JsonKey Shape shape, @JsonKey long roomId, @JsonKey long sheetId) {
        sheetService.modify(Long.parseLong(p.getName()), shape, roomId, sheetId);
    }

    @MessageMapping("/delete")
    public void delete(Principal p, @JsonKey long shapeId, @JsonKey long roomId, @JsonKey long sheetId){
        sheetService.delete(Long.parseLong(p.getName()), roomId, sheetId, shapeId);
    }


    @MessageMapping("/change_sheet")
    @SendToUser("/queue/info")
    public Message changeSheet(Principal p, @JsonKey long sheetId, @JsonKey long roomId){
        return Message.def("change_sheet",
                sheetService.getSheetById(sheetId, roomId, Long.parseLong(p.getName())));
    }

}
