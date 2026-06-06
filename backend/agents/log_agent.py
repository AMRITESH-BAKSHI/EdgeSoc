def collect_relevant_logs(alert, log_file):

    attack_type = alert["attack_type"]

    evidence = []

    with open(log_file, "r") as f:

        logs = f.readlines()

    if attack_type == "sql_injection":

        for line in logs:

            if "SQL_QUERY" in line:
                evidence.append(line.strip())

    elif attack_type == "brute_force":

        ip = alert["source_ip"]

        for line in logs:

            if (
                "LOGIN_FAILED" in line
                and ip in line
            ):
                evidence.append(line.strip())

    elif attack_type == "ddos":

        ip = alert["source_ip"]

        for line in logs:

            if (
                "REQUEST" in line
                and ip in line
            ):
                evidence.append(line.strip())

    return evidence

