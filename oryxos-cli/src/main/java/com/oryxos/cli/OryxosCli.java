package com.oryxos.cli;

import picocli.CommandLine;
import picocli.CommandLine.Command;

/**
 * OryxOS CLI 主入口。
 * 后续子命令（init/chat/serve/gateway 等）挂到这里。
 */
@Command(name = "oryxos",
        version = "oryxos 0.1.0-SNAPSHOT",
        mixinStandardHelpOptions = true,
        description = "OryxOS - 企业级 Agent Harness OS（一个目录 = 一个 Agent）")
public class OryxosCli implements Runnable {

    @Override
    public void run() {
        // 无参数时默认打印版本信息
        System.out.println("oryxos 0.1.0-SNAPSHOT");
        System.out.println("OryxOS - 企业级 Agent Harness OS");
        System.out.println("JDK 21 + Spring Boot 3.x | 私有部署 · 可审计");
    }

    public static void main(String[] args) {
        int exitCode = new CommandLine(new OryxosCli()).execute(args);
        System.exit(exitCode);
    }
}
