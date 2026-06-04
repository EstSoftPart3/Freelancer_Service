package com.example.demo.domain.point.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.point.dto.PointHistoryResponse;
import com.example.demo.domain.point.dto.PointResponse;
import com.example.demo.domain.point.mapper.PointMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PointServiceImpl implements PointService {

	private final PointMapper pointMapper;

	@Override
	@Transactional(readOnly = true)
	public PointResponse getMyPoint(Long userSq) {
		int pointAmount = pointMapper.selectPointAmount(userSq);

		return new PointResponse(pointAmount);
	}

	@Override
	@Transactional(readOnly = true)
	public List<PointHistoryResponse> getMyPointHistory(Long userSq) {
		return pointMapper.selectPointHistory(userSq);
	}

	@Override
	@Transactional
	public void earnAttendancePoint(Long userSq) {

		int earnPoint = 100;

		int pointCount = pointMapper.countPointByUserSq(userSq);

		if (pointCount == 0) {
			pointMapper.insertPoint(userSq);
		}

		Long pointSq = pointMapper.selectPointSqByUserSq(userSq);

		int currentPoint = pointMapper.selectPointAmount(userSq);
		int remainPoint = currentPoint + earnPoint;

		pointMapper.updatePointAmount(userSq, remainPoint);

		pointMapper.insertAttendancePointHistory(pointSq, userSq, "EARN", earnPoint, remainPoint, "출석체크 포인트 적립");
	}
}