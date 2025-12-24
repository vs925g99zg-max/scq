// 批量条形码生成系统

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const barcodeForm = document.getElementById('barcodeForm');
    const barcodeData = document.getElementById('barcodeData');
    const barcodeType = document.getElementById('barcodeType');
    const barcodeWidth = document.getElementById('barcodeWidth');
    const barcodeHeight = document.getElementById('barcodeHeight');
    const showText = document.getElementById('showText');
    const textAbove = document.getElementById('textAbove');
    const textBelow = document.getElementById('textBelow');
    const generateBtn = document.getElementById('generateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const barcodeContainer = document.getElementById('barcodeContainer');
    
    // 播放控制DOM元素
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const playbackIntervalInput = document.getElementById('playbackInterval');
    const currentBarcodeInfo = document.getElementById('currentBarcodeInfo');
    
    // 弹出窗口DOM元素
    const playbackModal = document.getElementById('playbackModal');
    const modalBarcodeContainer = document.getElementById('modalBarcodeContainer');
    const modalCurrentBarcodeInfo = document.getElementById('modalCurrentBarcodeInfo');
    const modalStopBtn = document.getElementById('modalStopBtn');
    const modalContinueBtn = document.getElementById('modalContinueBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const playbackEndMessage = document.getElementById('playbackEndMessage');
    
    // 播放状态变量
    let isPlaying = false;
    let currentBarcodeIndex = 0;
    let playbackInterval = null;
    
    // 生成条形码按钮点击事件
    generateBtn.addEventListener('click', function() {
        generateBarcodes();
    });
    
    // 导出按钮点击事件
    exportBtn.addEventListener('click', function() {
        exportBarcodes();
    });
    
    // 清空按钮点击事件
    clearBtn.addEventListener('click', function() {
        clearBarcodes();
    });
    
    // 表单提交事件
    barcodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateBarcodes();
    });
    
    // 生成条形码函数
    function generateBarcodes() {
        // 获取输入数据
        const dataList = barcodeData.value.trim().split('\n').filter(item => item.trim() !== '');
        
        if (dataList.length === 0) {
            alert('请输入条形码数据！');
            return;
        }
        
        // 获取配置参数
        const type = barcodeType.value;
        const width = parseInt(barcodeWidth.value);
        const height = parseInt(barcodeHeight.value);
        const text = showText.checked;
        
        // 清空之前的条形码
        barcodeContainer.innerHTML = '';
        
        // 生成每个条形码
        dataList.forEach((data, index) => {
            // 创建条形码容器
            const barcodeItem = document.createElement('div');
            barcodeItem.className = 'barcode-item';
            
            // 添加上方文字
            const aboveText = textAbove.value.trim();
            if (aboveText) {
                const textAboveElem = document.createElement('p');
                textAboveElem.className = 'text-above';
                textAboveElem.textContent = aboveText;
                barcodeItem.appendChild(textAboveElem);
            }
            
            // 创建SVG元素用于生成条形码
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = `barcode-${index}`;
            
            // 使用JsBarcode生成条形码
            JsBarcode(svg, data.trim(), {
                format: type,
                width: width,
                height: height,
                displayValue: text,
                fontSize: 18,
                margin: 10,
                lineColor: '#000000',
                background: '#ffffff'
            });
            
            // 添加条形码数据文本
            const dataText = document.createElement('p');
            dataText.textContent = data.trim();
            
            // 将SVG和文本添加到容器
            barcodeItem.appendChild(svg);
            barcodeItem.appendChild(dataText);
            
            // 添加下方文字
            const belowText = textBelow.value.trim();
            if (belowText) {
                const textBelowElem = document.createElement('p');
                textBelowElem.className = 'text-below';
                textBelowElem.textContent = belowText;
                barcodeItem.appendChild(textBelowElem);
            }
            
            // 将条形码项添加到主容器
            barcodeContainer.appendChild(barcodeItem);
        });
        
        // 显示导出按钮
        exportBtn.style.display = 'inline-block';
    }
    
    // 导出条形码函数
    function exportBarcodes() {
        if (barcodeContainer.children.length === 0) {
            alert('请先生成条形码！');
            return;
        }
        
        // 使用html2canvas将条形码容器转换为图片
        html2canvas(barcodeContainer, {
            scale: 2, // 提高图片质量
            useCORS: true,
            logging: false
        }).then(function(canvas) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `barcodes_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(function(error) {
            console.error('导出失败:', error);
            alert('导出失败，请重试！');
        });
    }
    
    // 清空条形码函数
    function clearBarcodes() {
        // 停止播放
        stopPlayback();
        
        barcodeContainer.innerHTML = '';
        barcodeData.value = '';
        exportBtn.style.display = 'none';
        
        // 更新播放信息
        currentBarcodeIndex = 0;
        updateCurrentBarcodeInfo(0, 0);
    }
    
    // ----------------------
    // 条码播放功能
    // ----------------------
    
    // 播放按钮点击事件
    playBtn.addEventListener('click', function() {
        startPlayback();
    });
    
    // 暂停按钮点击事件
    pauseBtn.addEventListener('click', function() {
        pausePlayback();
    });
    
    // 弹出窗口停止按钮点击事件
    modalStopBtn.addEventListener('click', function() {
        stopPlayback();
    });
    
    // 弹出窗口继续按钮点击事件
    modalContinueBtn.addEventListener('click', function() {
        if (!isPlaying) {
            startPlayback();
        }
    });
    
    // 弹出窗口专门的关闭按钮点击事件
    modalCloseBtn.addEventListener('click', function() {
        closePlaybackModal();
    });
    
    // 弹出窗口关闭按钮点击事件
    closeModalBtn.addEventListener('click', function() {
        closePlaybackModal();
    });
    
    // 点击弹出窗口外部关闭窗口
    playbackModal.addEventListener('click', function(e) {
        if (e.target === playbackModal) {
            closePlaybackModal();
        }
    });
    
    // ESC键关闭弹出窗口
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && playbackModal.classList.contains('show')) {
            closePlaybackModal();
        }
    });
    
    // 开始播放
    function startPlayback() {
        const barcodeItems = barcodeContainer.querySelectorAll('.barcode-item');
        
        if (barcodeItems.length === 0) {
            alert('请先生成条形码！');
            return;
        }
        
        // 隐藏播放结束提示
        playbackEndMessage.style.display = 'none';
        
        isPlaying = true;
        updatePlaybackButtons(true);
        
        // 打开弹出窗口
        openPlaybackModal(barcodeItems);
        
        // 开始播放循环
        playNextBarcode(barcodeItems);
    }
    
    // 播放间隔变化事件
    playbackIntervalInput.addEventListener('change', function() {
        if (isPlaying) {
            // 如果正在播放，重新启动以应用新的间隔
            restartPlayback();
        }
    });
    
    // 打开播放弹出窗口
    function openPlaybackModal(barcodeItems) {
        console.log('openPlaybackModal called');
        
        // 清空弹出窗口中的条码容器
        modalBarcodeContainer.innerHTML = '';
        
        // 复制所有条码到弹出窗口
        barcodeItems.forEach(item => {
            const clone = item.cloneNode(true);
            modalBarcodeContainer.appendChild(clone);
        });
        
        // 显示弹出窗口
        playbackModal.classList.add('show');
        updateModalButtons(true);
    }
    
    // 关闭播放弹出窗口
    function closePlaybackModal() {
        playbackModal.classList.remove('show');
    }
    
    // 暂停播放
    function pausePlayback() {
        isPlaying = false;
        updatePlaybackButtons(false);
        updateModalButtons(false);
        
        // 清除播放间隔
        if (playbackInterval) {
            clearTimeout(playbackInterval);
            playbackInterval = null;
        }
        
        // 移除所有高亮
        const barcodeItems = barcodeContainer.querySelectorAll('.barcode-item');
        barcodeItems.forEach(item => item.classList.remove('active'));
        
        const modalBarcodeItems = modalBarcodeContainer.querySelectorAll('.barcode-item');
        modalBarcodeItems.forEach(item => item.classList.remove('active'));
        
        updateCurrentBarcodeInfo(0, barcodeItems.length);
        updateModalCurrentBarcodeInfo(0, barcodeItems.length);
    }
    
    // 停止播放
    function stopPlayback() {
        isPlaying = false;
        updatePlaybackButtons(false);
        updateModalButtons(false);
        
        // 清除播放间隔
        if (playbackInterval) {
            clearTimeout(playbackInterval);
            playbackInterval = null;
        }
        
        // 移除播放模式样式
        barcodeContainer.classList.remove('playback-mode');
        
        // 重置当前索引
        currentBarcodeIndex = 0;
        
        // 移除所有高亮
        const barcodeItems = barcodeContainer.querySelectorAll('.barcode-item');
        barcodeItems.forEach(item => item.classList.remove('active'));
        
        const modalBarcodeItems = modalBarcodeContainer.querySelectorAll('.barcode-item');
        modalBarcodeItems.forEach(item => item.classList.remove('active'));
        
        // 更新信息
        updateCurrentBarcodeInfo(0, barcodeItems.length);
        updateModalCurrentBarcodeInfo(0, barcodeItems.length);
        
        // 不再自动关闭弹出窗口，保留窗口以便用户查看
    }
    
    // 重新启动播放
    function restartPlayback() {
        pausePlayback();
        
        // 隐藏播放结束提示
        playbackEndMessage.style.display = 'none';
        
        startPlayback();
    }
    
    // 播放下一个条码
    function playNextBarcode(barcodeItems) {
        if (!isPlaying) return;
        
        // 移除所有高亮
        barcodeItems.forEach(item => item.classList.remove('active'));
        
        const modalBarcodeItems = modalBarcodeContainer.querySelectorAll('.barcode-item');
        modalBarcodeItems.forEach(item => item.classList.remove('active'));
        
        // 高亮当前条码
        const currentBarcodeItem = barcodeItems[currentBarcodeIndex];
        currentBarcodeItem.classList.add('active');
        
        // 高亮弹出窗口中的当前条码
        const currentModalBarcodeItem = modalBarcodeItems[currentBarcodeIndex];
        currentModalBarcodeItem.classList.add('active');
        
        // 滚动到当前条码（如果需要）
        currentBarcodeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 更新当前条码信息
        updateCurrentBarcodeInfo(currentBarcodeIndex + 1, barcodeItems.length);
        updateModalCurrentBarcodeInfo(currentBarcodeIndex + 1, barcodeItems.length);
        
        // 获取播放间隔（毫秒）
        const interval = parseInt(playbackIntervalInput.value);
        
        // 检查是否是最后一个条码
        if (currentBarcodeIndex === barcodeItems.length - 1) {
            // 播放到最后一个条码，显示完后暂停但不关闭窗口
            setTimeout(function() {
                isPlaying = false;
                updatePlaybackButtons(false);
                updateModalButtons(false);
                
                // 清除播放间隔
                if (playbackInterval) {
                    clearTimeout(playbackInterval);
                    playbackInterval = null;
                }
                
                // 显示播放结束提示
                playbackEndMessage.style.display = 'block';
                
                // 重置当前索引
                currentBarcodeIndex = 0;
                
                updateCurrentBarcodeInfo(0, barcodeItems.length);
                updateModalCurrentBarcodeInfo(0, barcodeItems.length);
            }, interval);
        } else {
            // 不是最后一个，继续播放下一个
            currentBarcodeIndex++;
            
            // 设置下一个播放
            playbackInterval = setTimeout(function() {
                playNextBarcode(barcodeItems);
            }, interval);
        }
    }
    
    // 更新播放按钮状态
    function updatePlaybackButtons(playing) {
        playBtn.disabled = playing;
        pauseBtn.disabled = !playing;
    }
    
    // 更新弹出窗口按钮状态
    function updateModalButtons(playing) {
        modalStopBtn.disabled = false;
        modalContinueBtn.disabled = playing;
    }
    
    // 更新当前条码信息
    function updateCurrentBarcodeInfo(current, total) {
        currentBarcodeInfo.textContent = `${current}/${total}`;
    }
    
    // 更新弹出窗口条码信息
    function updateModalCurrentBarcodeInfo(current, total) {
        modalCurrentBarcodeInfo.textContent = `${current}/${total}`;
    }
});