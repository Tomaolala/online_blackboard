package com.obb.online_blackboard.entity.operate;

import com.obb.online_blackboard.config.Context;
import com.obb.online_blackboard.dao.redis.ShapeDao;
import com.obb.online_blackboard.entity.base.Operate;
import com.obb.online_blackboard.entity.base.Save;
import com.obb.online_blackboard.entity.base.Shape;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tool.result.Message;

import java.util.Optional;
import java.util.Set;

/**
 * @author 陈桢梁
 * @desc Set.java
 * @date 2022-11-01 20:04
 * @logs[0] 2022-11-01 20:04 陈桢梁 创建了Set.java文件
 */
@AllArgsConstructor
@Data
public class Modify implements Operate {

    long from;

    long to;
    @Override
    public void rollback(Set<Long> shapes, long sheetId,long roomId, Save save) {
        Modify(shapes, roomId, from, to, save, sheetId);
    }

    @Override
    public void redo(Set<Long> shapes, long sheetId,long roomId, Save save) {
        Modify(shapes, roomId, to, from, save, sheetId);
    }

    private void Modify(Set<Long> shapes, long roomId, long to, long from, Save save, long sheetId) {
        shapes.remove(to);
        shapes.add(from);
        SimpMessagingTemplate s = Context.getContext().getBean(SimpMessagingTemplate.class);
        s.convertAndSend("/exchange/room/" + roomId, Message.del(to, sheetId));
        ApplicationContext app = Context.getContext();
        ShapeDao shapeDao = app.getBean(ShapeDao.class);
        Optional<Shape> shape = shapeDao.findById(from);
        save.save();
        s.convertAndSend("/exchange/room/" + roomId, Message.add(shape.get(), sheetId));
    }
}
