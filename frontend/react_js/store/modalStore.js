import {useState} from 'react'
import {create} from 'zustand'

export const useModalStore = create((set, get) => ({
    modalStack: [], //[{Component, props}]

    // 프로젝트 지원현황 토글 상태 저장 추가
    currentToggle: true,
    setToggle: (value) => set({currentToggle: value}),
    getToggle: () => get().currentToggle,
    resetToggle: () => set({currentToggle: true}),

    //선택적 구독을 위해 geter 사용(selector에서 계산 x)
    getCurrentModal:() => {
        const stack = get().modalStack;
        return stack.length ? stack[stack.length - 1] : null;
    },
    isOpen: () => get().modalStack.length > 0,

    openModal: (component, props = {}) => 
        set((s) => ({ modalStack: [...s.modalStack, {component, props}] })),

    closeModal: () => 
        set((s) => ({ modalStack: s.modalStack.slice(0, -1) })),

    closeAll: () => set({ modalStack: [] }),

    //최상단 모달 교체
    replaceTop: (component, props = {}) =>
        set((s) => {
            if (s.modalStack.length === 0) return s;
            const next = s.modalStack.slice();
            next[next.length - 1] = {component, props};
            return {modalStack: next};
        }),
}));